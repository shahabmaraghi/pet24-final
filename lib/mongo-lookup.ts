import dns from "dns";

const resolver = new dns.Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

type LookupCallback = (err: NodeJS.ErrnoException | null, address: string, family: number) => void;

/** Resolve Atlas hosts with public DNS. The local resolver answers mongodb.net with an address that resets TLS. */
export function mongoLookup(hostname: string, options: dns.LookupOptions | LookupCallback, callback?: LookupCallback) {
  const done = typeof options === "function" ? options : callback;
  if (!done) return;
  resolver.resolve4(hostname, (error, addresses) => {
    if (error || !addresses?.length) {
      dns.lookup(hostname, { family: 4 }, done);
      return;
    }
    done(null, addresses[0], 4);
  });
}
