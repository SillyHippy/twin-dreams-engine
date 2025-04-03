
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
    
    // Create the topic if it doesn't exist (with better error handling)
    const messaging = context.appwrite.messaging;
    
    try {
      // First check if the subscriber already exists to avoid duplicate errors
      await messaging.createSubscriber(topicId, messageData.to, 'email');
    } catch (subscriberError) {
      // If error is not about duplicate subscriber, log it but continue
      if (!subscriberError.message?.includes('already exists')) {
        context.log(`Subscriber creation warning (continuing): ${subscriberError.message}`);
      }
    }
    
    // Send message
    try {
      const result = await messaging.createMessage(topicId, message);
      
      // Return success response
      return res.json({
        success: true,
        message: "Email sent successfully",
        data: result
      });
    } catch (messageError) {
      context.error(`Error creating message: ${messageError.message}`);
      return res.json({
        success: false,
        message: `Failed to create message: ${messageError.message}`
      }, 500);
    }
  } catch (err) {
    context.error(`Error in sendEmail function: ${err.message}`);
    return res.json({
      success: false,
      message: `Failed to send email: ${err.message}`,
      error: err.stack
    }, 500);
  }
};
