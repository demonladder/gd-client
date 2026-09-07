/**
 * The credentials {@link Client.login} derives, in the shape the signed endpoints expect them
 * in a request body — spread these into the params rather than assigning them field by field.
 */
export interface AuthCredentials {
    accountID: number;
    gjp2: string;
}
