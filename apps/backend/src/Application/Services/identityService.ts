import { PrismaClient } from '@prisma/client';
import { IdentityInput } from '@votechain/common';

const prisma = new PrismaClient();

export class IdentityService {
  async verifyCedula(input: IdentityInput) {
    const citizen = await prisma.citizen.findUnique({
      where: { cedula: input.cedula },
    });
    
    if (!citizen) {
      throw new Error('errors.identity.not_found');
    }

    if (citizen.registrationStatus !== 'VERIFIED') {
      throw new Error('errors.identity.not_verified');
    }

    return {
      userId: citizen.id,
      name: citizen.fullName,
      status: citizen.registrationStatus,
      document_type: 'CÉDULA DE IDENTIDAD Y ELECTORAL',
      verification_node: citizen.node,
      timestamp: new Date().toISOString()
    };
  }
}
