declare module 'js-cookie' {
  interface CookieAttributes {
    /**
     * Define when the cookie will be removed. Value can be a Number
     * which will be interpreted as days from time of creation or a
     * Date instance. If omitted, the cookie becomes a session cookie.
     */
    expires?: number | Date;
  
    /**
     * Define the path where the cookie is available. Defaults to '/'
     */
    path?: string;
  
    /**
     * Define the domain where the cookie is available. Defaults to
     * the domain of the page where the cookie was created.
     */
    domain?: string;
  
    /**
     * A Boolean indicating if the cookie transmission requires a
     * secure protocol (https). Defaults to false.
     */
    secure?: boolean;
  
    /**
     * Asserts that a cookie must not be sent with cross-origin requests,
     * providing some protection against cross-site request forgery
     * attacks (CSRF)
     */
    sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None';
  
    /**
     * An attribute which will be serialized, conformably to RFC 6265
     * section 5.2.
     */
    [property: string]: any;
  }
  
  interface CookiesStatic {
    /**
     * Parse all available cookies
     */
    readonly _?: Record<string, string>;
  
    /**
     * Create a cookie
     */
    set(name: string, value: string | object, options?: CookieAttributes): string | undefined;
  
    /**
     * Read cookie
     */
    get(name: string): string | undefined;
  
    /**
     * Read all available cookies
     */
    get(): Record<string, string>;
  
    /**
     * Delete cookie
     */
    remove(name: string, options?: CookieAttributes): void;
  
    /**
     * Default cookie attributes
     */
    withAttributes(attributes: CookieAttributes): CookiesStatic;
  
    /**
     * Set default cookie path
     */
    withConverter(converter: {
      read(value: string): string | object;
      write(value: string | object): string;
    }): CookiesStatic;
  }
  
  const Cookies: CookiesStatic;
  export default Cookies;
} 