const { graphql } = require('graphql');
const schema = require('../graphql/schema').graphqlSchema;
const siteName = 'Yandex Переговорки';
const { getRecommendation } = require('./getRecomendation');
const queryUsers = `{
    users{
      id
      login
      homeFloor
      avatarUrl
    }
  }`;
const queryRooms = '{\n' +
  '  rooms {\n' +
  '    id\n' +
  '    title\n' +
  '    capacity\n' +
  '    floor\n' +
  '  }\n' +
  '}';
const queryEvents = '{\n' +
  '  events {\n' +
  '    id\n' +
  '    title\n' +
  '    dateStart\n' +
  '    dateEnd\n' +
  '    users {\n' +
  '      id\n' +
  '      login\n' +
  '      homeFloor\n' +
  '      avatarUrl\n' +
  '    }\n' +
  '    room {\n' +
  '      id\n' +
  '      title\n' +
  '      capacity\n' +
  '      floor\n' +
  '    }\n' +
  '  }\n' +
  '}';

module.exports.index = async function(req, res) {
  const floors = [];
  let roomsQueryData = await graphql(schema, queryRooms);
  const rooms = roomsQueryData.data.rooms;
  
  rooms.sort((a,b) => a.floor - b.floor);
  distributeRoomsByFloors(rooms, floors);

  await graphql(schema, queryEvents).then( data => {
    const events = data.data.events;
    // сортировка по времени начала ивентовб для грамотной работы алгоритма
    events.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
    
    events.forEach( event => {
      let eventFloor = event.room.floor;
      let targetFloor = floors.filter((floor) => floor.number === eventFloor);
      let targetRoom = targetFloor[0].rooms.filter(room => room.id === event.room.id);

      // set date object ane init start and end time
      event.dateStart = new Date(event.dateStart);
      event.dateEnd = new Date(event.dateEnd);

      // проверям на корекность заданой даты
      validateDate(event);
      
      //create field timeLine
      if (!Array.isArray(targetRoom[0].timeLine)) {
        
        if (getStartDiff(event) !== 0) {
          event.flexGrow = getFlexGrow(event);
          targetRoom[0].timeLine = [
            { id: 'helper',
              flexGrow: getStartDiff(event),
              dateStart: getExtremeDate(event, 'start'),
              dateEnd: event.dateStart
            },
            event,
            {
              id: 'helper',
              flexGrow: (900 - event.flexGrow - getStartDiff(event)),
              dateStart: event.dateEnd,
              dateEnd: getExtremeDate(event, 'end')
            } //TODO:[A.Ivankov] возможно не стоит добавлять если flex grow === 0
          ]; //init timeLine
          
        } else {
          event.flexGrow = getFlexGrow(event);
          targetRoom[0].timeLine = [
            event,
            { id: 'helper',
              flexGrow: (900 - event.flexGrow),
              dateStart: event.dateEnd,
              dateEnd: getExtremeDate(event, 'end')
            }
          ];
        }
        
      } else {
        let timeLine = targetRoom[0].timeLine;
        timeLine.pop(); // ремувим последнего helper'a
        let eventsInTimeLine =
          timeLine.slice().filter((event) => event.id !== 'helper');
        let lastEvent = eventsInTimeLine[eventsInTimeLine.length-1];
        if (getDiffTwoEvents(lastEvent, event) !== 0) {
          event.flexGrow = getFlexGrow(event);
          // TODO:[A.Ivankov] если последний элемент не  хэлпер тогда мы до сюда вообще не должны дойти так как это будет событие которое завершпется ровно в 23:00
          let sumFlexGrow = timeLine
            .map(elem => elem.flexGrow)
            .reduce((sum, current) => sum + current);
          timeLine.push(
            {
              id: 'helper',
              dateStart: lastEvent.dateEnd,
              dateEnd: event.dateStart,
              flexGrow: getDiffTwoEvents(lastEvent, event) // TODO:[A.Ivankov] optimization - save in constant
            },
            event,
            {
              id: 'helper',
              flexGrow: getEndDiff(event),
              dateStart: event.dateEnd,
              dateEnd: getExtremeDate(event, 'end')
            }
          );
        }
      }
    });
  });
  if (req.body.isCreateMeting) {
    const queryAddedRoom = `{
      event(id: ${req.body.idNewMeeting}) {
        title
        dateStart
        dateEnd
        room {
          title
          floor
        }
      }
    }`;
    let addedEvent = await graphql(schema, queryAddedRoom);
    addedEvent = addedEvent.data.event;
    addedEvent.dateStart = new Date(addedEvent.dateStart);
    addedEvent.dateEnd = new Date(addedEvent.dateEnd);
    res.render('main', { title: 'Календарь', siteName, rooms, floors, addedEvent });
  } else {
    // res.json(floors);
    res.render('main', { title: 'Календарь', siteName, rooms, floors, addedEvent: null });
  }
  // res.json(floors);
};

module.exports.addMeeting = async function (req, res) {
  graphql(schema, queryUsers).then( data => {
    const members = data.data.users;
    // res.json(data.data.users);
    res.render('add-meeting', { title: 'Создание встречи', siteName, members});
  });
};

module.exports.createNewMeeting = function (req, res, next) {
  let timeStart = getCorrectTimeFormat(req.body.date, req.body.startTime);
  let timeEnd = getCorrectTimeFormat(req.body.date, req.body.endTime);
  if (!Array.isArray(req.body.member)) {
    req.body.member = [req.body.member];
  }
  res.json(req.body);
  let mutationQuery = `mutation create {
    createEvent(input: {
      title: "${req.body.title}",
      dateEnd: "${timeEnd.toISOString()}",
      dateStart: "${timeStart.toISOString()}"
    } usersIds: [${req.body.member}] roomId: 2) {
      id
    }
  }`;
  graphql(schema, mutationQuery).then( data => {
    req.body.idNewMeeting = data.data.createEvent.id;
    req.body.isCreateMeting = true;
    // res.json(req.body);
    next();
  });
};

module.exports.editMeeting = async function (req, res) {
  const queryEvent = `{
    event(id: ${parseInt(req.params.id, 10)}) {
      title
      dateStart
      dateEnd
      users {
        id
        login
        homeFloor
        avatarUrl
      }
      room {
        id
        title
        floor
      }
    }
  }`;
  let eventData = await graphql(schema, queryEvent);
  let members = await graphql(schema, queryUsers);
  members = members.data.users;
  eventData = eventData.data.event;
  eventData.dateStart = new Date(eventData.dateStart);
  eventData.dateEnd = new Date(eventData.dateEnd);
  const selectMembers = [];
  eventData.users.forEach((user) => selectMembers.push(user.id));
  eventData.id = req.params.id;
  res.render('edit-meeting', { title: 'Редактирование встречи', siteName, members, eventData, selectMembers });
};

module.exports.updateMeeting = async function (req, res) {
  let timeStart = getCorrectTimeFormat(req.body.date, req.body.startTime);
  let timeEnd = getCorrectTimeFormat(req.body.date, req.body.endTime);
  if (!Array.isArray(req.body.member)) {
    req.body.member = [req.body.member];
  }
  const queryEvent = `{
    event(id: ${parseInt(req.params.id, 10)}) {
      title
      dateStart
      dateEnd
      users {
        id
      }
      room {
        id
      }
    }
  }`;
  let currentEventData = await graphql(schema, queryEvent);
  currentEventData = currentEventData.data.event;
  // processing update query
  let titleCondition = currentEventData.title === req.body.title;
  let startTimeCondition = Date.parse(currentEventData.dateStart) === Date.parse(timeStart);
  let endTimeCondition = Date.parse(currentEventData.dateEnd) === Date.parse(timeEnd);
  console.log(titleCondition, startTimeCondition, endTimeCondition)
  if (!(titleCondition && startTimeCondition && endTimeCondition)) {
    let updateQuery = `mutation updateEvent {
      updateEvent (id: "${req.params.id}"
        input: {
          title: "${req.body.title}"
          dateStart: "${timeStart.toISOString()}"
          dateEnd: "${timeEnd.toISOString()}"
        }
      ) {
        id
      }
    }`;
    console.log('change event')
    // await graphql(schema, updateQuery);
  }
  // processing Users
  let addUsers = [];
  let removeUsers = [];
  let currentUsersId = currentEventData.users.map( user => user.id);
  currentUsersId.forEach(user => {
    if(req.body.member.indexOf(user) === -1) {
     removeUsers.push(user); //TODO:[A.Ivankov] вставить сразу запросы
    }
  });
  req.body.member.forEach(user => {
    if(currentUsersId.indexOf(user) === -1) {
      addUsers.push(user); //TODO:[A.Ivankov] вставить сразу запросы
    }
  });
  console.log(addUsers, removeUsers);
  
  req.body.startTime = timeStart;
  req.body.endTime = timeEnd;
  res.json(req.body);
  // await graphql(schema, removeMeetingQuery);
};

module.exports.removeMeeting = async function (req, res) {
  let idEvent = req.params.id;
  const removeMeetingQuery = `mutation removeEvent {
    removeEvent (id: "${idEvent}") {
      id
    }
  }`;
  await graphql(schema, removeMeetingQuery);
  res.redirect('/');
};

function validateDate(event) {
  let validDate = true;
  if (getFlexGrow(event) < 0) {
    //switch time
    [event.dateStart, event.dateEnd] = [event.dateEnd, event.dateStart];
  }
  if (getFlexGrow(event) === 0) {
    validDate = false;
  }
  return validDate;
}

function getFlexGrow(event) {
  return Math.floor((event.dateEnd.getTime() - event.dateStart.getTime()) / 1000 / 60)
}

function getStartDiff(event) {
  let openTime = getExtremeDate(event, 'start');
  return Math.floor((event.dateStart.getTime() - openTime.getTime()) / 1000 / 60)
}

function getEndDiff(event) {
  let closeTime = getExtremeDate(event, 'end');
  return Math.floor((closeTime.getTime() - event.dateEnd.getTime()) / 1000 / 60)
}

function getExtremeDate(event, extreme) {
  if (extreme === 'start') {
    return new Date(Date.UTC(
      event.dateStart.getUTCFullYear(),
      event.dateStart.getUTCMonth(),
      event.dateStart.getUTCDate(),
      8,
      0
    ));
  } else if (extreme === 'end') {
    return new Date(Date.UTC(
      event.dateStart.getUTCFullYear(),
      event.dateStart.getUTCMonth(),
      event.dateStart.getUTCDate(),
      23,
      0
    ));
  } else {
   console.log('error in getExtremeDate')
  }
}

// event on time < event two time
function getDiffTwoEvents(eventOne, eventTwo) {
  return Math.floor((eventTwo.dateStart.getTime() - eventOne.dateEnd.getTime()) / 1000 / 60)
}

function getCorrectTimeFormat(date, time) {
  let dateParts = date.split(' ');
  let timeParts = time.split(':');
  let numberMonth = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря'
    ].indexOf(dateParts[1].toLowerCase());
  return new Date(Date.UTC(
    dateParts[2],
    numberMonth,
    dateParts[0],
    timeParts[0],
    timeParts[1]
  ));
}

function distributeRoomsByFloors(rooms, floors) {
  let previousFloor;
  rooms.forEach((room) => {
    room.events = []; // create support field
    if (previousFloor !== room.floor) {
      const floor = {
        number: room.floor,
        rooms: [room],
      };
      floors.push(floor);
      previousFloor = room.floor
    } else {
      floors[[floors.length - 1]].rooms.push(room);
    }
  });
}
