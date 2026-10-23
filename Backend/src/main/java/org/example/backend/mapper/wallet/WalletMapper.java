package org.example.backend.mapper.wallet;


import org.example.backend.dto.response.wallet.WalletResponse;
import org.example.backend.entity.Wallet;
import org.mapstruct.Mapper;
import java.util.List;
@Mapper(componentModel = "spring")
public interface WalletMapper {
    // Chuyển từ Entity -> Response DTO
    WalletResponse toWalletResponse(Wallet wallet);
    // Chuyển danh sách Entity -> danh sách Response DTO
    List<WalletResponse> toWalletResponseList(List<Wallet> wallets);
}
