package org.example.backend.event.createEvent;

import lombok.Getter;
import org.example.backend.entity.Transaction;
import org.springframework.context.ApplicationEvent;

@Getter
public class TransactionCreatedEvent extends  ApplicationEvent{
    private final Transaction transaction;

    public TransactionCreatedEvent(Object sourse,Transaction transaction) {
        super(sourse);
        this.transaction = transaction;
    }
}
