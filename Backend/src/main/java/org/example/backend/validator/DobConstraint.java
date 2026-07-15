package org.example.backend.validator;

import com.nimbusds.jose.Payload;
import jakarta.validation.Constraint;

import java.lang.annotation.*;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(
        validatedBy = {DobValidator.class}
)
public @interface DobConstraint {
    String message() default "Invalid date of birth";
    int min();
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
