import { ContextDictionary } from './types';
// types
import { AccessResponse, IntegrationDatapoints, SeedInput } from './types';

// Helper functions for working with the Mailgun API.
import { erasure, fetchAllLists, searchMailingLists, seed } from './mailgunHelpers';

// The API key
export const MAILGUN_API_KEY = 'b36d2969-296079d2';

// The base URL for the Mailgun API
export const MAILGUN_BASE_URL = 'https://api.mailgun.net/v3';

export const mailgunDataPoints: IntegrationDatapoints = {
  /**
   * Create mailing lists and Seed user(s) onto them
   */
  seed: async (seedInput: SeedInput): Promise<void> => {
    return seed(seedInput.identifier, seedInput.mailingList);
  },
  /**
   * Get all mailing lists that the user belongs to
   */
  access: async (identifier: string): Promise<AccessResponse> => {
    const { items } = await fetchAllLists()
    const subscribedLists = await searchMailingLists(identifier, items)

    const contextDict: { [key in string]: any } = {
      mailingLists: items
    };

    return { data: subscribedLists.map(list => list.address), contextDict }
  },
  /**
   * Remove the user from all mailing lists.
   * NOTE: Erasure runs an Access (access()) before it to
   * fetch the context data it might need.
   */
  erasure: async (identifier: string, contextDict?: object): Promise<void> => {
    erasure(identifier, contextDict as ContextDictionary);
  },
};
