import { FastifyReply, FastifyRequest } from 'fastify';
import { Contact } from '../models/Contact';
import { logger } from '../utils/logger';
import { sendContactNotification } from '../services/emailService';

export const submitContactForm = async (
  request: FastifyRequest<{
    Body: {
      name: string;
      email: string;
      subject: string;
      message: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { name, email, subject, message } = request.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return reply.status(400).send({
        success: false,
        message: 'All fields are required',
      });
    }

    // Basic email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid email address',
      });
    }

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await newContact.save();

    logger.info({ contactId: newContact._id }, 'New contact form submission received');

    // Send email notification (non-blocking — don't await to keep response fast)
    sendContactNotification({ name, email, subject, message });

    return reply.status(201).send({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error saving contact form submission');
    return reply.status(500).send({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
};

export const getContactMessages = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // This would typically be an admin-only route
    const messages = await Contact.find().sort({ createdAt: -1 });
    return reply.status(200).send({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error fetching contact messages');
    return reply.status(500).send({
      success: false,
      message: 'Internal server error',
    });
  }
};
