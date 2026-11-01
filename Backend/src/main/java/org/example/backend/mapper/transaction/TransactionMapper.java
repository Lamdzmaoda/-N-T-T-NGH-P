package org.example.backend.mapper.transaction;

import org.example.backend.dto.request.transaction.TransactionRequest;
import org.example.backend.dto.response.transcation.TransactionResponse;
import org.example.backend.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface TransactionMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "wallet", ignore = true)
    @Mapping(target = "destinationWallet", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "balanceAfter", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Transaction toTransaction(TransactionRequest request);
    @Mapping(source = "wallet.id", target = "walletId")
    @Mapping(source = "wallet.name", target = "walletName")
    @Mapping(source = "destinationWallet.id", target = "destinationWalletId")
    @Mapping(source = "destinationWallet.name", target = "destinationWalletName")
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "category.icon", target = "categoryIcon")
    @Mapping(source = "category.color", target = "categoryColor")
    TransactionResponse toTransactionResponse(Transaction transaction);
}
