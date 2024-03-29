package com.projektr.codeblaze.service;

import com.projektr.codeblaze.dao.MessageRepository;
import com.projektr.codeblaze.domain.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    @Autowired
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public List<Message> getMessagesByChatSessionId(Long chatSessionId) {
        return messageRepository.findByChatSessionChatSessionIdOrderBySentTimeAsc(chatSessionId);
    }

    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    public int markMessagesAsRead(Long chatSessionId, String nickname) {
        return messageRepository.markMessagesAsRead(chatSessionId, nickname);
    }

    public boolean delete(Long messageId) {
        boolean exists = messageRepository.existsById(messageId);
        if (exists) {
            messageRepository.deleteById(messageId);
        }
        return exists;
    }
}
