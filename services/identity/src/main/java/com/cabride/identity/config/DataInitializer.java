package com.cabride.identity.config;

import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.cabride.identity.entities.Address;
import com.cabride.identity.entities.Role;
import com.cabride.identity.entities.RoleType;
import com.cabride.identity.entities.User;
import com.cabride.identity.enums.UserGender;
import com.cabride.identity.repository.RoleRepository;
import com.cabride.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

	private final RoleRepository roleRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	public void run(String... args) {

		Role adminRole = roleRepository.findByName(RoleType.ADMIN)
				.orElseGet(() -> roleRepository.save(
						new Role(null, RoleType.ADMIN, "Administrator")));
		roleRepository.findByName(RoleType.DRIVER)
				.orElseGet(() -> roleRepository.save(
						new Role(null, RoleType.DRIVER, "Driver")));
		roleRepository.findByName(RoleType.RIDER)
				.orElseGet(() -> roleRepository.save(
						new Role(null, RoleType.RIDER, "Rider")));

		if (userRepository.findByEmail("admin@cabride.com").isEmpty()) {

			Address address = Address.builder()
					.id(null)
					.pinCode("534237")
					.street("street-1")
					.state("AP")
					.country("India")
					.build();
			User admin = User.builder()
					.firstName("System")
					.lastName("Admin")
					.email("admin@cabride.com")
					.gender(UserGender.MALE)
					.password(passwordEncoder.encode("admin123"))
					.address(address)
					.enabled(true)
					.createdAt(LocalDateTime.now())
					.updatedAt(LocalDateTime.now())
					.roles(Set.of(adminRole)).build();

			userRepository.save(admin);
		}
	}

}