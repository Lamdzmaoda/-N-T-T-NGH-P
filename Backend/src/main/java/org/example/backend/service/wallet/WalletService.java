package org.example.backend.service.wallet;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.wallet.WalletCreationRequest;
import org.example.backend.dto.request.wallet.WalletUpdateRequest;
import org.example.backend.dto.response.wallet.TotalBalanceResponse;
import org.example.backend.dto.response.wallet.WalletResponse;
import org.example.backend.entity.User.User;
import org.example.backend.entity.Wallet;
import org.example.backend.enums.WalletType;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.wallet.WalletMapper;
import org.example.backend.repository.auth.UserRepository;
import org.example.backend.repository.wallet.WalletRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WalletService {
    WalletRepository walletRepository;
    UserRepository userRepository;
    WalletMapper walletMapper;
    AuthenticationService authenticationService;



    @Transactional
    public WalletResponse createWallet(WalletCreationRequest request){
        User user = authenticationService.getUserByContext();
        if(walletRepository.existsByUserIdAndNameIgnoreCaseAndIsActiveTrue(user.getId(), request.getName())){
            throw new AppException(ErrorCode.WALLET_NAME_EXISTED);
        }
        BigDecimal balance = request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO;

        boolean includeInTotal = request.getIncludeInTotal() != null ? request.getIncludeInTotal() : true;

        Wallet wallet = Wallet.builder()
                .user(user)
                .name(request.getName().trim())
                .type(request.getType())
                .balance(balance)
                .currency("VND")
                .includeInTotal(includeInTotal)
                .isActive(true)
                .build();

        return walletMapper.toWalletResponse(walletRepository.save(wallet));
     }
    public List<WalletResponse> getMyWallets() {
        return walletRepository.findAll().stream().map(walletMapper::toWalletResponse).toList();
    }
    public List<WalletResponse> getMyWalletsOfType(WalletType type) {
        User user = authenticationService.getUserByContext();
        List<Wallet> wallets = walletRepository.findByUserIdAndTypeAndIsActiveTrue(user.getId(), type);
        return walletMapper.toWalletResponseList(wallets);
    }

    public WalletResponse getWalletById(String id) {
        User user = authenticationService.getUserByContext();
        Wallet wallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
        return walletMapper.toWalletResponse(wallet);
    }
    @Transactional
    public WalletResponse updateWallet(String id, WalletUpdateRequest request){
        User user = authenticationService.getUserByContext();

        Wallet wallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));

        if(!wallet.getName().equalsIgnoreCase(request.getName()) && walletRepository.existsByUserIdAndNameIgnoreCaseAndIsActiveTrue(user.getId(), request.getName())){
            throw new AppException(ErrorCode.WALLET_NAME_EXISTED);
        }

        wallet.setName(request.getName().trim());
        wallet.setType(request.getType());
        if(request.getIncludeInTotal() != null){
            wallet.setIncludeInTotal(request.getIncludeInTotal());
        }

        return  walletMapper.toWalletResponse(walletRepository.save(wallet));
    }

    @Transactional
    public void deleteWallet(String id) {
        User user = authenticationService.getUserByContext();
        Wallet wallet = walletRepository.findByIdAndUserIdAndIsActiveTrue(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));
        // Xóa mềm: đánh dấu isActive = false để không mất dữ liệu giao dịch cũ
        wallet.setIsActive(false);
        walletRepository.save(wallet);
    }

    public TotalBalanceResponse getTotalBalance(){
        User user = authenticationService.getUserByContext();
        List<Wallet> wallets = walletRepository.findByUserIdAndIsActiveTrue(user.getId());

        BigDecimal total = wallets.stream().filter(wallet -> wallet.getIncludeInTotal() == true).map(Wallet::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        return TotalBalanceResponse.builder()
                .totalBalance(total)
                .currency("VND")
                .totalWallets(wallets.size())
                .build();
    }

}
