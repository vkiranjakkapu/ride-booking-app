package com.cabride.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cabride.identity.entities.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {
    
}
