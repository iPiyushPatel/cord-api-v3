import { registerEnumType } from 'type-graphql';

export enum Role {
  Admin = 'adm',
  BibleTranslationLiaison = 'btl',
  Consultant = 'c',
  ConsultantManager = 'cm',
  Controller = 'con',
  Development = 'd',
  ExecutiveDevelopmentRepresentative = 'edr',
  ExecutiveLeadership = 'el',
  FieldOperationsDirector = 'fod',
  FieldPartner = 'fp',
  FinancialAnalyst = 'fa',
  Intern = 'i',
  Liaison = 'l',
  LeadFinancialAnalyst = 'lfa',
  Mentor = 'm',
  OfficeOfThePresident = 'ootp',
  ProjectManager = 'pm',
  RegionalCommunicationsCoordinator = 'rcc',
  RegionalDirector = 'rd',
  SupportingProjectManager = 'spm',
  Translator = 't',
  Writer = 'w',
}

registerEnumType(Role, { name: 'Role' });
