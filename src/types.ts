/**
 * The types necessary for this integration
 */

import { type } from "os";

// ContextDictionary represents a context object that encapsulates
// information that is needed by multiple parts of the program in a single, easily accessible object.
export type ContextDictionary = {
  subscribedMailingLists: MailingList[];
}


export type SeedInput = {
  identifier: string;
  mailingList: string;
  // other custom fields below, if necessary
};

export type AccessResponse = {
  // the personal data retrieved
  data: object;
  // the context necessary to perform an Erasure
  contextDict?: { [key in string]: any };
};

export type IntegrationDatapoints = {
  // the Seed function
  seed: (seedInput: SeedInput) => Promise<void>;
  // the Access datapoint
  access: (identifier: string) => Promise<AccessResponse>;
  // the Erasure datapoint
  erasure: (identifier: string, contextDict?: object) => Promise<void>;
};

export enum ActionType {
  Access = 'ACCESS',
  Erasure = 'ERASURE',
  Seed = 'SEED',
}

// Paging type describes the pagination information for a Mailgun API response.
export type Paging = {
  first: string;       // URL for the first page of results
  last: string;        // URL for the last page of results
  next?: string;       // URL for the next page of results, if it exists
  previous?: string;   // URL for the previous page of results, if it exists
};

// MailingList type describes a single mailing list, including its email address, description, and member count.
export type MailingList = {
  address: string;         // email address of the mailing list
  description: string;     // description of the mailing list
  members_count: number;   // number of members subscribed to the mailing list
}

// MailingListsResponse type describes a response that includes an array of MailingList objects and pagination information.
export type MailingListsResponse = {
  items: MailingList[];    // an array of mailing lists
  paging: Paging;          // pagination information for the response
};

// ListMember type describes a single member of a mailing list, 
// including their email address, name, subscription status, and any additional variables.
export type ListMember = {
  address: string;                   // email address of the list member
  name: string;                      // name of the list member
  subscribed: boolean;               // whether the list member is subscribed to the mailing list
  vars: Record<string, unknown>;     // any additional variables associated with the list member
}

// ListMembersResponse type describes a response that includes an array of ListMember objects and pagination information.
export type ListMembersResponse = {
  items: ListMember[];                // an array of list members
  paging: Paging;                     // pagination information for the response
};