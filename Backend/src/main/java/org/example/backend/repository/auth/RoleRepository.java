package org.example.backend.repository.auth;

import org.example.backend.entity.RBAC.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role,String> {

}
