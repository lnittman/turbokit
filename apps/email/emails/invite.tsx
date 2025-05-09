import React from 'react';

import { InviteEmailTemplate } from '@repo/email/templates/invite';

const ExampleInviteEmail = () => (
  <InviteEmailTemplate
    inviterName="luke nittmann"
    chatTitle="wello world"
    inviteLink="http://localhost:9091/invite/1234567890"
  />
);

export default ExampleInviteEmail; 