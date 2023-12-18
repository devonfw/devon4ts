import * as nodemailer from 'nodemailer';
import * as JSONTransport from 'nodemailer/lib/json-transport';
import * as SendmailTransport from 'nodemailer/lib/sendmail-transport';
import * as SESTransport from 'nodemailer/lib/ses-transport';
import * as SMTPPool from 'nodemailer/lib/smtp-pool';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as StreamTransport from 'nodemailer/lib/stream-transport';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import * as Handlebars from 'handlebars';

// Copied from Handlebars, they do not export it
export interface ICompileOptions {
  data?: boolean;
  compat?: boolean;
  knownHelpers?: {
    helperMissing?: boolean;
    blockHelperMissing?: boolean;
    each?: boolean;
    if?: boolean;
    unless?: boolean;
    with?: boolean;
    log?: boolean;
    lookup?: boolean;
  };
  knownHelpersOnly?: boolean;
  noEscape?: boolean;
  strict?: boolean;
  assumeObjects?: boolean;
  preventIndent?: boolean;
  ignoreStandalone?: boolean;
  explicitPartialContext?: boolean;
}

// Copied from handlebars, they do not export it
export interface IPrecompileOptions extends ICompileOptions {
  srcName?: string;
  destName?: string;
}

export type MailerModuleOptions = IMailerModuleOptions;

interface IMailerModuleOptions {
  hbsOptions?: IHandlebarsOptions;
  mailOptions?:
    | nodemailer.TransportOptions
    | SESTransport.Options
    | JSONTransport.Options
    | StreamTransport.Options
    | SendmailTransport.Options
    | SMTPPool.Options
    | SMTPTransport.Options
    | string;
  emailFrom: string;
}

export interface IHandlebarsOptions {
  templatesDir: string;
  extension?: string;
  partialsDir?: string;
  helpers?: IHelperFunction[];
  compilerOptions?: ICompileOptions;
}

export type HelperFunction = IHelperFunction;

interface IHelperFunction {
  name: string;
  func: Handlebars.HelperDelegate;
}

export type MailerModuleAsyncOptions = IMailerModuleAsyncOptions;

interface IMailerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<MailerModuleOptions> | MailerModuleOptions;
  inject?: any[];
}
