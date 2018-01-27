const { graphql } = require('graphql');
const schema = require('../graphql/schema').graphqlSchema;
const siteName = 'Yandex Переговорки';

module.exports.index = function(req, res) {
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
  graphql(schema, queryRooms).then( data => {
    const rooms = data.data.rooms;
    const floors = [];
    rooms.sort((a,b) => a.floor - b.floor);
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
    graphql(schema, queryEvents).then( data => {
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
        
        // targetRoom[0].events.push(event); // create field with rooms
        if (!Array.isArray(targetRoom[0].timeLine)) {

          if (getStartDiff(event) !== 0) {
            event.flexGrow = getFlexGrow(event);
            targetRoom[0].timeLine = [
              { id: 'helper', flexGrow: getStartDiff(event)},
              event,
              { id: 'helper', flexGrow: (900 - event.flexGrow - getStartDiff(event))} //TODO:[A.Ivankov] возможно не стоит добавлять если flex grow === 0
            ]; //init timeLine

          } else {
            event.flexGrow = getFlexGrow(event);
            targetRoom[0].timeLine = [
              event,
              { id: 'helper', flexGrow: (900 - event.flexGrow)}
            ];
          }

        } else {
          let timeLine = targetRoom[0].timeLine;
          let eventsInTimeLine =
            timeLine.filter((event) => event.id !== 'helper');
          let lastEvent = eventsInTimeLine[eventsInTimeLine.length-1];

          if (getDiffTwoEvents(lastEvent, event) !== 0) {
            event.flexGrow = getFlexGrow(event);
            // TODO:[A.Ivankov] если последний элемент не  хэлпер тогда мы до сюда вообще не должны дойти так как это будет событие которое завершпется ровно в 23:00
            timeLine.pop(); // ремувим последнего helper'a
            let sumFlexGrow = timeLine
              .map(elem => elem.flexGrow)
              .reduce((sum, current) => sum + current)
            timeLine.push(
              {
                id: 'helper',
                flexGrow: getDiffTwoEvents(lastEvent, event) // TODO:[A.Ivankov] optimization - save in constant
              },
              event,
              {
                id: 'helper',
                flexGrow: 900 - sumFlexGrow - event.flexGrow
              }
            );
          }
        }
      });
      
      // res.json(floors);
      res.render('main', {title: 'Календарь', siteName, rooms, floors});
    });
  });
};

module.exports.addMeeting = function (req, res) {
  const queryUsers = `{
    users{
      id
      login
      homeFloor
      avatarUrl
    }
  }`;
  graphql(schema, queryUsers).then( data => {
    const members = data.data.users;
    res.render('add-meeting', { title: 'Создание встречи', siteName, members });
  });
};

module.exports.createNewMeeting = function (req, res, next) {
  res.json(req.body);
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
  let openTime = new Date(Date.UTC(
    event.dateStart.getFullYear(),
    event.dateStart.getMonth(),
    event.dateStart.getDate(),
    8,
    0
  ));
  return Math.floor((event.dateStart.getTime() - openTime.getTime()) / 1000 / 60)
}

function getDiffTwoEvents(eventOne, eventTwo) {
  return Math.floor((eventOne.dateEnd.getTime() - eventTwo.dateStart.getTime()) / 1000 / 60)
}