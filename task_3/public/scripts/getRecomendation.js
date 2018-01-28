module.exports.getRecommendation = function getRecommendation(date, members, db) {
  // sort rooms by floors
  let floors = [];
  db.rooms.forEach(room => {
    if(floors.indexOf(room.floor) !== -1) {
      floors.push(room.floor);
    }
  });
};