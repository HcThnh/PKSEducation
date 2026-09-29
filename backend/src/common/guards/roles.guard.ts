import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { ROLE_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLE_KEY,
            [context.getHandler(),
            context.getClass(),]
        );

        if(!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.role) {
            throw new ForbiddenException("Not authorizied")
        }

        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException("Not authorizied");
        }

        return true;
    }
}