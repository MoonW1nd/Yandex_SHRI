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
  let db = {};
  let members;
  let date = {
    start: '2018-01-27T12:00:00.000Z',
    end: '2018-01-27T22:20:04.454Z'
  };
  members = [
    {
      login: 'alt-j',
      avatar: 'https://avatars1.githubusercontent.com/u/3763844?s=400&v=4',
      floor: 3
    },
    {
      login: 'yeti-or',
      avatar: 'https://avatars0.githubusercontent.com/u/1813468?s=460&v=4',
      floor: 2
    }
  ];
  // find date
  let users = await graphql(schema, queryUsers);
  let rooms = await graphql(schema, queryRooms);
  let events = await graphql(schema, queryEvents);
  db.persons = [];
  users.data.users.forEach(user => {
    db.persons.push({
      login: user.login,
      floor: user.homeFloor,
      avatar: user.avatarUrl
    });
  });
  db.rooms = rooms.data.rooms;
  db.events = [];
  events.data.events.forEach((event) => {
    event.users.forEach( (user, i) => {
      event.users[i] = user.login;
    });
    event.room = parseInt(event.room.id);
    db.events.push({
      id: event.id,
      title: event.title,
      date: {
        start: event.dateStart,
        end: event.dateEnd
      },
      members: event.users,
      room: event.room
    });
  });
  // let result = getRecommendation(date, members, db);
  res.json(getRecommendation(date, members, db));
  // res.json(req.body.response);
  // graphql(schema, queryUsers).then( data => {
  //   const members = data.data.users;
  //   res.render('add-meeting', { title: 'Создание встречи', siteName, members });
  // });
};

module.exports.createNewMeeting = function (req, res, next) {
  let timeStart = getCorrectTimeFormat(req.body.date, req.body.startTime);
  let timeEnd = getCorrectTimeFormat(req.body.date, req.body.endTime);
  if (!Array.isArray(req.body.member)) {
    req.body.member = [req.body.member];
  }
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

module.exports.editMeeting = async function (req, res, next) {
  const queryEevent = `{
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
        title
        floor
      }
    }
  }`;
  let eventData = await graphql(schema, queryEevent);
  let members = await graphql(schema, queryUsers);
  members = members.data.users;
  eventData = eventData.data.event;
  eventData.dateStart = new Date(eventData.dateStart);
  eventData.dateEnd = new Date(eventData.dateEnd);
  const selectMembers = [];
  eventData.users.forEach((user) => selectMembers.push(user.id));
  res.render('edit-meeting', { title: 'Редактирование встречи', siteName, members, eventData, selectMembers });
  // res.json(members);
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
