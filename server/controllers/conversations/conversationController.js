module.exports = {
  ...require('./handlers/createConversation'),
  ...require('./handlers/selectCompanion'),
  ...require('./handlers/getConversations'),
  ...require('./handlers/getConversation'),
  ...require('./handlers/sendMessage'),
  ...require('./handlers/deleteConversation'),
  ...require('./handlers/markAsRead')
};