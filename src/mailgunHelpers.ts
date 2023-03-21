// external imports
import axios from 'axios';

// local imports
import { LIMIT_DEFAULT } from './constants';
import { MAILGUN_API_KEY, MAILGUN_BASE_URL } from './mailgunDatapoints';
import { ContextDictionary, ListMembersResponse, MailingList, MailingListsResponse } from './types';

/**
 * Finds email lists that contain a certain subscriber.
 * @param identifier Email address to look for.
 * @param lists The mailing lists to iterate through.
 * @returns MailingList[] containing only the list that the specified user is subscribed to.
 * @throws Error if API request or response processing fails.
 */
export async function searchMailingLists(identifier: string, lists: MailingList[]): Promise<MailingList[]> {

    // Initialize an empty array to hold the subscribed mailing lists.
    const subscribedMailingLists: MailingList[] = [];

    // Construct the base URL for the Mailgun API.
    const url = `${MAILGUN_BASE_URL}/lists`;

    // Loop through each mailing list in the 'lists' array.
    for (const mailingList of lists) {
        try {
            // Construct the URL for the members of the current mailing list.
            const membersUrl = `${url}/${mailingList.address}/members/pages`;

            // Make a GET request to the Mailgun API to retrieve the members of the current mailing list.
            const membersResponse = await axios.get<ListMembersResponse>(membersUrl, {
                auth: {
                    username: 'api',
                    password: MAILGUN_API_KEY,
                }
            });

            // Check if the response contains any list members whose email address matches the 'identifier' argument
            // and who are marked as subscribed. If there is a match, add the current mailing list to the 'subscribedMailingLists' array.
            const isSubscribed = membersResponse.data.items.some((listMember) => listMember.address === identifier && listMember.subscribed);
            if (isSubscribed) {
                subscribedMailingLists.push(mailingList);
            }
        }
        catch (error) {
            // Handle errors that occur during the API request or processing of the response data
            if (error.response) {
                // The API request was made and the server responded with a non-2xx status code
                throw new Error(`Mailgun API error: ${error.response.status} ${error.response.statusText}`);
            } else if (error.request) {
                // The API request was made but no response was received
                throw new Error(`Mailgun API request error: ${error.request}`);
            } else {
                // An error occurred while setting up the API request or processing the response data
                throw new Error(`Mailgun API error: ${error.message}`);
            }
        }
    };

    // Return the array of subscribed mailing lists.
    return subscribedMailingLists;;
}

/**
 * Retrieves all email lists within the organization.
 * @returns ListMembersResponse object with retrieved data.
 * @throws Error if API request or response processing fails.
 */
export async function fetchAllLists(): Promise<MailingListsResponse> {
    let url = `${MAILGUN_BASE_URL}/lists/pages`;

    try {
        // Make the API request using Axios
        const response = await axios.get<MailingListsResponse>(url, {
            auth: {
                username: 'api',
                password: MAILGUN_API_KEY,
            },
            // Construct the query parameters for the API request
            params: {
                limit: LIMIT_DEFAULT,
            }
        });

        const data = response.data;

        // Check if the response data has the expected structure
        if (!Array.isArray(data.items)) {
            throw new Error(`Unexpected response from Mailgun API: ${JSON.stringify(data)}`);
        }

        // Return the MailingListsResponse object with the retrieved data
        return data;
    }
    catch (error) {
        // Handle errors that occur during the API request or processing of the response data
        if (error.response) {
            // The API request was made and the server responded with a non-2xx status code
            throw new Error(`Mailgun API error: ${error.response.status} ${error.response.statusText}`);
        } else if (error.request) {
            // The API request was made but no response was received
            throw new Error(`Mailgun API request error: ${error.request}`);
        } else {
            // An error occurred while setting up the API request or processing the response data
            throw new Error(`Mailgun API error: ${error.message}`);
        }
    }
}

/**
 * Removes an email address from the specified mailing lists.
 * @param identifier Email address to remove.
 * @param contextDict Context dictionary containing the mailing lists to remove the address from.
 * @throws Error if API request fails.
 */
export async function erasure(identifier: string, contextDict: ContextDictionary): Promise<void> {

    // Construct the base URL for the Mailgun API.
    const url = `${MAILGUN_BASE_URL}/lists`;

    try {
        // Use Promise.all to make DELETE requests to Mailgun API for each mailing list in the context dictionary
        await Promise.all(
            (contextDict?.subscribedMailingLists ?? []).map((mailingListAddress) =>
                axios.delete(`${url}/${mailingListAddress}/members/${identifier}`, {
                    auth: {
                        username: 'api',
                        password: MAILGUN_API_KEY,
                    }
                })
            )
        );
    }
    catch (error) {
        // Handle errors that occur during the API requests
        if (error.response) {
            // The API request was made and the server responded with a non-2xx status code
            throw new Error(`Mailgun API error: ${error.response.status} ${error.response.statusText}`);
        } else if (error.request) {
            // The API request was made but no response was received
            throw new Error(`Mailgun API request error: ${error.request}`);
        } else {
            // An error occurred while setting up the API request
            throw new Error(`Mailgun API error: ${error.message}`);
        }
    }
}

/**
 * Adds an email address to a specified mailing list.
 * @param identifier Email address to add.
 * @param mailingList Mailing list to add the address to.
 * @throws Error if API request fails.
 */
export async function seed(identifier: string, mailingList: string): Promise<void> {

    // Construct the base URL for the Mailgun API.
    const url = `${MAILGUN_BASE_URL}/lists`;

    try {
        // Make the API request using Axios to add the email address to the specified mailing list
        await axios.post(`${url}/${mailingList}/members`, null, {
            auth: {
                username: 'api',
                password: MAILGUN_API_KEY,
            },
            // Construct the query parameters for the API request
            params: {
                address: identifier,
                upsert: 'yes'
            },
        });
    } catch (error) {
        // Handle errors that occur during the API request
        if (error.response) {
            // The API request was made and the server responded with a non-2xx status code
            throw new Error(`Mailgun API error: ${error.response.status} ${error.response.statusText}`);
        } else if (error.request) {
            // The API request was made but no response was received
            throw new Error(`Mailgun API request error: ${error.request}`);
        } else {
            // An error occurred while setting up the API request
            throw new Error(`Mailgun API error: ${error.message}`);
        }
    }
}