const pool = require('../../db/connection');

/**
 * Get notifications for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotifications = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Get notifications with conversation details
    const [notifications] = await pool.execute(`
      SELECT 
        n.*,
        c.title as conversation_title,
        comp.name as companion_name
      FROM notifications n
      LEFT JOIN conversations c ON n.conversation_id = c.id
      LEFT JOIN companions comp ON c.companion_id = comp.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, [user_id, limit, offset]);

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [user_id]
    );

    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      notifications,
      pagination: {
        total: totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

/**
 * Mark notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { notification_id } = req.params;

    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [notification_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

/**
 * Mark all notifications as read for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { user_id } = req.params;

    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [user_id]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

/**
 * Delete a notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteNotification = async (req, res) => {
  try {
    const { notification_id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ?',
      [notification_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

/**
 * Create a notification (internal use)
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification
 */
const createNotification = async (notificationData) => {
  try {
    const { user_id, conversation_id, type, title, message } = notificationData;

    const [result] = await pool.execute(`
      INSERT INTO notifications (user_id, conversation_id, type, title, message, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [user_id, conversation_id, type, title, message]);

    const notificationId = result.insertId;

    // Get the created notification
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [notificationId]
    );

    return notifications[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUnreadCount = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [user_id]
    );

    res.json({ unread_count: result[0].count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount
}; 