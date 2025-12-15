package com.jing.service;

import com.jing.domain.OrderType;
import com.jing.model.Order;
import com.jing.model.User;
import com.jing.model.Wallet;
import com.jing.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    public Wallet getUserWallet(User user) {
        Wallet wallet = walletRepository.findByUserId(user.getId());
        if (wallet == null) {
            wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(BigDecimal.ZERO);
            walletRepository.save(wallet);
        }
        return wallet;
    }

    public Wallet addBalance(Wallet wallet, BigDecimal money) {
        BigDecimal balance = wallet.getBalance();
        BigDecimal updatedBalance = balance.add(money);
        wallet.setBalance(updatedBalance);
        return walletRepository.save(wallet);
    }

    public Wallet findWalletById(Long id) throws Exception {
        return walletRepository.findById(id).orElseThrow(() -> new Exception("Wallet not found"));
    }

    public Wallet walletToWalletTransfer(User sender, Wallet receiverWallet, BigDecimal amount) throws Exception {
        Wallet senderWallet = getUserWallet(sender);

        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new Exception("Insufficient balance");
        }

        BigDecimal senderBalance = senderWallet.getBalance().subtract(amount);
        senderWallet.setBalance(senderBalance);
        walletRepository.save(senderWallet);

        BigDecimal receiverBalance = receiverWallet.getBalance().add(amount);
        receiverWallet.setBalance(receiverBalance);
        walletRepository.save(receiverWallet);

        return senderWallet;
    }

    public Wallet payOrderPayment(Order order, User user) throws Exception {
        Wallet wallet = getUserWallet(user);

        if (order.getOrderType().equals(OrderType.BUY)) {
            BigDecimal newBalance = wallet.getBalance().subtract(order.getPrice());
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new Exception("Insufficient balance for this transaction");
            }
            wallet.setBalance(newBalance);
        } else {
            BigDecimal newBalance = wallet.getBalance().add(order.getPrice());
            wallet.setBalance(newBalance);
        }

        walletRepository.save(wallet);
        return wallet;
    }

    public Wallet withdraw(User user, BigDecimal amount) throws Exception {
        Wallet wallet = getUserWallet(user);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new Exception("Insufficient funds");
        }
        BigDecimal newBalance = wallet.getBalance().subtract(amount);
        wallet.setBalance(newBalance);
        return walletRepository.save(wallet);
    }
}
