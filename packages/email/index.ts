import { Resend } from 'resend';
import { keys } from './keys';

export const resend = new Resend(keys().RESEND_TOKEN);

// Export templates
export { ContactTemplate } from './templates/contact';
export { InviteEmailTemplate } from './templates/invite';
