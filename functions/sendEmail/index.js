
// Appwrite function to send emails through the messaging service
module.exports = async function(context) {
  try {
    const { req, res, log, error } = context;
    
    // Parse request data
    const data = JSON.parse(req.body);
    
    const { topicId, providerId, messageData, metadata } = data;
    
    if (!topicId || !providerId || !messageData) {
      return res.json({
        success: false,
        message: "Missing required parameters"
      }, 400);
    }
    
    // Format message for Appwrite messaging API
    const message = {
      userId: 'unique',
      providerType: 'smtp',
      providerId: providerId,
      targetId: messageData.to,
      content: {
        subject: messageData.subject,
        html: messageData.html || messageData.text,
        text: messageData.text
      },
    };
    
    // Add attachments if present
    if (messageData.attachments && messageData.attachments.length > 0) {
      message.content.attachments = messageData.attachments;
    }
    
    // Send message using Appwrite SDK (available in the context)
    const messaging = context.appwrite.messaging;
    
    // Create subscriber first (this step is crucial)
    await messaging.createSubscriber(topicId, messageData.to, 'email');
    
    // Send message to the subscriber
    const result = await messaging.createMessage(topicId, message);
    
    // Return success response
    return res.json({
      success: true,
      message: "Email sent successfully",
      data: result
    });
  } catch (err) {
    context.error(`Error sending email: ${err.message}`);
    return res.json({
      success: false,
      message: `Failed to send email: ${err.message}`,
      error: err.stack
    }, 500);
  }
};
