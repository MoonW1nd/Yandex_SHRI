export function getRecommendation(date, members, db) {
  
  // sort rooms by floors
  let floors = [];
  let rooms = JSON.parse(JSON.stringify(db.rooms));
  let startEventDate = Date.parse(date.start);
  startEventDate = new Date(startEventDate);
  let needDate = new Date(
    startEventDate.getUTCFullYear(),
    startEventDate.getUTCMonth(),
    startEventDate.getUTCDate()
    );
  let needDateTrigerStart = needDate.getTime();
  let needDateTrigerEnd = needDate.getTime() + 86400000;
  // фильтруем по дате
  db.events = db.events.filter(event => needDateTrigerStart < Date.parse(event.date.start) < needDateTrigerEnd);
  rooms.forEach( room => {
    if(floors.indexOf(room.floor) === -1) {
      floors.push(room.floor);
    }
  });
  floors = floors.map( floor => {
    return { floorNumber: floor}
  });
  // надем сумму этажей пройдееную всеми участниками для каждого этажа
  floors.forEach( floor => {
    let floorNumber = floor.floorNumber;
    floor.count = 0; // init count

    members.forEach(member => {
      floor.count += Math.abs((member.floor - parseInt(floorNumber, 10)));
    });
  });
  // // сортируем по меньшему числу пройденных этажей
  floors.sort((a, b) => a.count - b.count);
  // // ищем подходящие комнаты на этом этаже
  let allRecommendation = [];
  floors.forEach( floor => {
    let recommendedRooms = rooms.filter( room => room.floor === floor.floorNumber);
    // фильтрровка и сортировка по вместимости
    recommendedRooms = recommendedRooms.filter(room => room.capacity >= members.length);
    recommendedRooms.sort((a, b) => a.capacity - b.capacity);
    floor.rooms = JSON.parse(JSON.stringify(recommendedRooms));
    // проверка по времени
    let copyEvents = JSON.parse(JSON.stringify(db.events));
    recommendedRooms.forEach( room => {
      let eventsInRoom = copyEvents.filter(event => event.room === parseInt(room.id, 10));
      room.dateValid = true;
      room.events = eventsInRoom;
      
      // validation date
      eventsInRoom.forEach((eventInRoom) => {
        let dateStartValid = Date.parse(date.start) >= Date.parse(eventInRoom.date.end);
        let dateEndValid = Date.parse(date.end) <= Date.parse(eventInRoom.date.start);
        if(!(dateEndValid || dateStartValid)) {
          room.dateValid = false;
        }
      });
    });
    allRecommendation = allRecommendation.concat(recommendedRooms);
  });
  console.log(allRecommendation)
  //копируем для будующих операций
  let roomsWithEvents = JSON.parse(JSON.stringify(rooms));
  // set recommended rooms id
  
  allRecommendation = allRecommendation.filter(room => room.dateValid);
  if (allRecommendation.length !== 0) {
    let result = [];
    allRecommendation.forEach((room) => {
      result.push({
        date: {
          start: date.start,
          end: date.end
        },
        room: room.id,
        swap: []
      });
    });
    return result;
  } else {
    // find all event in this period
    let copyEvents = db.events.slice();
    copyEvents = copyEvents.filter( event => {
      let firstCondition = Date.parse(event.date.end) > Date.parse(date.start) && Date.parse(date.end) > Date.parse(event.date.start);
  
      let secondCondition = Date.parse(date.start) <= Date.parse(event.date.start) && Date.parse(date.end) >= Date.parse(event.date.end);
  
      let thirdCondition = Date.parse(date.start) >= Date.parse(event.date.start) && Date.parse(date.end) <= Date.parse(event.date.end);
      return (firstCondition || secondCondition || thirdCondition);
    });
    // проходимся по всем пересекающимся с нужным времем event'ам
    copyEvents.forEach( event => {
      // берем комнаты и проходимся по всем ивентам в комнатах
      rooms.forEach( room => {
        if(parseInt(room.id, 10) !== event.room) {
          let enableTransfer = true;
          room.events.forEach( eventInRoom => {
            // смотрим можно ли в эту комнату перенести переговорку
            let firstCondition = Date.parse(eventInRoom.date.end) > Date.parse(event.date.start) && Date.parse(event.date.end) > Date.parse(eventInRoom.date.start);
            
            let secondCondition = Date.parse(event.date.start) <= Date.parse(eventInRoom.date.start) && Date.parse(event.date.end) >= Date.parse(eventInRoom.date.end);
            
            let thirdCondition = Date.parse(event.date.start) >= Date.parse(eventInRoom.date.start) && Date.parse(event.date.end) <= Date.parse(eventInRoom.date.end);
            let dateValid = firstCondition || secondCondition || thirdCondition;
            
            // прошли ли все проверки по совместимости
            if(dateValid) {
              enableTransfer = false;
            }
          });
          // если все мероприятия прошли проверку совместимости то его можно перенести
          if (enableTransfer) {
            if (Array.isArray(room.swap)){
              let duplicate = room.swap.filter(item => item.eventMain === event.id);
              if (duplicate.length === 0) {
                room.swap.push({
                  event: event.id,
                  room: room.id,
                  roomEvent: event.room
                });
              }
            } else {
              room.swap = [{
                event: event.id,
                room: room.id,
                roomEvent: event.room
              }]
            }
          }
        }
      })
    });
    let result = [];
    let allSwaps = [];
    // создвем мвссив для ответа
    rooms.forEach(room => {
      if (room.swap != null) {
        allSwaps = allSwaps.concat(room.swap);
      }
    });
    // return allSwaps
    allSwaps.forEach( swap => {
      let room = db.rooms.filter(room => parseInt(swap.roomEvent, 10) === parseInt(room.id, 10));
      // console.log(room);
      if(room[0] != null) {
        swap.floorEvent = room[0].floor;
      }
    });
    
    let sortSwapsByFloor = [];
    // сортировка комнат по наименьшему количеству пройденных этажей
    floors.forEach(floor => {
      let swaps = allSwaps.filter(swap => {
        return String(floor.floorNumber) === String(swap.floorEvent)
      });
    // соединяем возможные переносы по комнатам которые освободятся
      sortSwapsByFloor.push(swaps);
    });
    // сортируем по освобождающимяся комнатам
    let resultMassive = [];
    sortSwapsByFloor.forEach( floorSwaps => {
      floorSwaps.sort( (a, b) => a.roomEvent - b.roomEvent);
      let trigger = null;
      floorSwaps.forEach( swap => {
        if(swap.roomEvent !== trigger) {
          trigger = swap.roomEvent;
          resultMassive.push([swap])
        } else {
          resultMassive[resultMassive.length - 1].push(swap);
        }
      })
    });
    
    // создаем требуемый формат ответа
    resultMassive.forEach((swaps) => {
      result.push({
        date: {
          start: date.start,
          end: date.end
        },
        room: swaps[0].roomEvent,
        swap: swaps.map( element => {
          return { event: element.event, room: element.room }
        })
      });
    });
    if (result.length !== 0) {
      return result
    } else {
      // блок подбора времни по времени освобождения переговоро
      let timeDiff = Date.parse(date.end) - Date.parse(date.start);
      let endTime = new Date(Date.parse(date.start));
      endTime.setUTCHours(23);
      endTime.setUTCMinutes(0);
      let eventsWithNewTime = [];
      roomsWithEvents.forEach( room => {
        let events = room.events;
        let eventsAfterStart = events.filter(event => Date.parse(event.date.end) > Date.parse(date.start));
        eventsAfterStart.forEach( eventAfterStart => {
          let newDate  = {
            start: Date.parse(eventAfterStart.date.end),
            end: (Date.parse(eventAfterStart.date.end) + timeDiff),
            room: eventAfterStart.room,
            validEvent: false
          };
          events.forEach( eventValidation => {
            console.log(eventValidation);
            let dateStartValid = newDate.start >= Date.parse(eventValidation.date.end);
            let dateEndValid = newDate.end <= Date.parse(eventValidation.date.start);
            if((dateEndValid || dateStartValid) && newDate.end < endTime.valueOf()) {
              newDate.dateValid = true;
            }
          });
          eventsWithNewTime.push(newDate);
        })
      });
      // фильтр по ближайшей освободившейся переговрке
      eventsWithNewTime.sort((a, b) => a.start - b.start);
      let recommendation = [];
      eventsWithNewTime.forEach( event => {
        recommendation.push({
          date: {
            start: new Date(event.start).toISOString(),
            end: new Date(event.end).toISOString()
          },
          room: event.room,
          swap: []
        })
      });
      return recommendation;
    }
  }
};