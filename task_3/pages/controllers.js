const { graphql } = require('graphql');
const schema = require('../graphql/schema').graphqlSchema;

module.exports.index = function(req, res) {
  graphql(schema, '{ rooms { id title capacity floor } }').then( data => {
    const rooms = data.data.rooms;
    res.render('main', {title: 'Календарь', siteName: 'Yandex Переговорки', rooms});
  });
};
