/**
 * Thrown when an endpoint needs credentials the client does not have, i.e. {@link Client.login}
 * has not been called.
 */
export class AuthenticationError extends Error {
    public constructor(public readonly action: string) {
        super(`You must authenticate in order to ${action}`);
    }
}
