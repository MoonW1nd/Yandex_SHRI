module.exports.getRecommendation = function getRecommendation(date, members, db) {
  // sort rooms by floors
  let floors = [];
  db.rooms.forEach( room => {
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
    let recommendedRooms = db.rooms.filter( room => room.floor === floor.floorNumber);
    // фильтрровка и сортировка по вместимости
    recommendedRooms = recommendedRooms.filter(room => room.capacity >= members.length);
    recommendedRooms.sort((a, b) => a.capacity - b.capacity);
    // console.log(recommendedRooms);
    // проверка по времени
    let copyEvents = db.events.slice();
    // console.log(copyEvents);
    recommendedRooms.forEach( room => {
      let eventsInRoom = copyEvents.filter(event => event.room === parseInt(room.id, 10));
      room.dateValid = true;
      room.events = eventsInRoom;
      eventsInRoom.forEach((eventInRoom) => {
        let dateStartValid = Date.parse(date.start) > Date.parse(eventInRoom.date.end);
        let dateEndValid = Date.parse(date.end) < Date.parse(eventInRoom.date.start);
        if(dateEndValid || dateStartValid) {
          room.dateValid = true;
        }
      });
    });
    allRecommendation = allRecommendation.concat(recommendedRooms);
  });
  // console.log(allRecommendation);
  allRecommendation = allRecommendation.filter(room => room.dateValid);
  if (allRecommendation.length = 0) {
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
    let copyEvents = db.events.slice();
    copyEvents = copyEvents.filter( event => {
      let dateStartIn = Date.parse(date.start) <= Date.parse(event.date.start);
      let dateEndIn = Date.parse(date.end) >= Date.parse(event.date.end);
      return dateEndIn && dateStartIn
    });
    console.log(copyEvents);
  }
};