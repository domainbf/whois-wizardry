
// Regional Internet Registries (RIRs) for IP addresses
export const IP_WHOIS_SERVERS = {
  // Default server for IP lookups
  default: "whois.iana.org",
  
  // Regional Internet Registries
  arin: "whois.arin.net",       // North America
  ripe: "whois.ripe.net",       // Europe, Middle East, Central Asia
  apnic: "whois.apnic.net",     // Asia Pacific
  afrinic: "whois.afrinic.net", // Africa
  lacnic: "whois.lacnic.net",   // Latin America and Caribbean
};

// Domain TLD WHOIS servers
export const DOMAIN_WHOIS_SERVERS: Record<string, string> = {
  // Generic TLDs
  "com": "whois.verisign-grs.com",
  "net": "whois.verisign-grs.com",
  "org": "whois.pir.org",
  "info": "whois.afilias.net",
  "biz": "whois.biz",
  "xyz": "whois.nic.xyz",
  "top": "whois.nic.top",
  "vip": "whois.nic.vip",
  "club": "whois.nic.club",
  "shop": "whois.nic.shop",
  "wang": "whois.gtld.knet.cn",
  "xin": "whois.gtld.knet.cn",
  "site": "whois.nic.site",
  "ltd": "whois.gtld.knet.cn",
  "online": "whois.nic.online",
  "cc": "ccwhois.verisign-grs.com",
  "tv": "tvwhois.verisign-grs.com",
  "me": "whois.nic.me",
  "co": "whois.nic.co",
  "io": "whois.nic.io",
  "app": "whois.nic.google",
  "dev": "whois.nic.google",
  "ai": "whois.nic.ai",
  
  // More generic TLDs
  "academy": "whois.nic.academy",
  "accountant": "whois.nic.accountant",
  "actor": "whois.nic.actor",
  "agency": "whois.nic.agency",
  "apartments": "whois.nic.apartments",
  "app": "whois.nic.google",
  "art": "whois.nic.art",
  "associates": "whois.nic.associates",
  "attorney": "whois.nic.attorney",
  "auction": "whois.nic.auction",
  "audio": "whois.uniregistry.net",
  "auto": "whois.uniregistry.net",
  "band": "whois.nic.band",
  "bar": "whois.nic.bar",
  "bargains": "whois.nic.bargains",
  "beer": "whois.nic.beer",
  "best": "whois.nic.best",
  "bid": "whois.nic.bid",
  "bike": "whois.nic.bike",
  "black": "whois.nic.black",
  "blog": "whois.nic.blog",
  "blue": "whois.nic.blue",
  "boutique": "whois.nic.boutique",
  "builders": "whois.nic.builders",
  "business": "whois.nic.business",
  "buzz": "whois.nic.buzz",
  "cab": "whois.nic.cab",
  "cafe": "whois.nic.cafe",
  "camera": "whois.nic.camera",
  "camp": "whois.nic.camp",
  "capital": "whois.nic.capital",
  "cards": "whois.nic.cards",
  "care": "whois.nic.care",
  "careers": "whois.nic.careers",
  "casa": "whois.nic.casa",
  "cash": "whois.nic.cash",
  "casino": "whois.nic.casino",
  "catering": "whois.nic.catering",
  "center": "whois.nic.center",
  "ceo": "whois.nic.ceo",
  "chat": "whois.nic.chat",
  "cheap": "whois.nic.cheap",
  "cloud": "whois.nic.cloud",
  "clothing": "whois.nic.clothing",
  "coach": "whois.nic.coach",
  "codes": "whois.nic.codes",
  "coffee": "whois.nic.coffee",
  "community": "whois.nic.community",
  "company": "whois.nic.company",
  "computer": "whois.nic.computer",
  "construction": "whois.nic.construction",
  "consulting": "whois.nic.consulting",
  "contact": "whois.nic.contact",
  "contractors": "whois.nic.contractors",
  "cool": "whois.nic.cool",
  "coupons": "whois.nic.coupons",
  "credit": "whois.nic.credit",
  "creditcard": "whois.nic.creditcard",
  "cruises": "whois.nic.cruises",
  "dance": "whois.nic.dance",
  "dating": "whois.nic.dating",
  "deals": "whois.nic.deals",
  "degree": "whois.nic.degree",
  "delivery": "whois.nic.delivery",
  "democrat": "whois.nic.democrat",
  "dental": "whois.nic.dental",
  "dentist": "whois.nic.dentist",
  "design": "whois.nic.design",
  "dev": "whois.nic.google",
  "diamonds": "whois.nic.diamonds",
  "digital": "whois.nic.digital",
  "direct": "whois.nic.direct",
  "directory": "whois.nic.directory",
  "discount": "whois.nic.discount",
  "domains": "whois.nic.domains",
  "earth": "whois.nic.earth",
  "education": "whois.nic.education",
  "email": "whois.nic.email",
  "energy": "whois.nic.energy",
  "engineer": "whois.nic.engineer",
  "engineering": "whois.nic.engineering",
  "enterprises": "whois.nic.enterprises",
  "equipment": "whois.nic.equipment",
  "estate": "whois.nic.estate",
  "events": "whois.nic.events",
  "exchange": "whois.nic.exchange",
  "expert": "whois.nic.expert",
  "express": "whois.nic.express",
  "fail": "whois.nic.fail",
  "family": "whois.nic.family",
  "fans": "whois.nic.fans",
  "farm": "whois.nic.farm",
  "finance": "whois.nic.finance",
  "financial": "whois.nic.financial",
  "fish": "whois.nic.fish",
  "fitness": "whois.nic.fitness",
  "flights": "whois.nic.flights",
  "florist": "whois.nic.florist",
  "football": "whois.nic.football",
  "forsale": "whois.nic.forsale",
  "foundation": "whois.nic.foundation",
  "fun": "whois.nic.fun",
  "fund": "whois.nic.fund",
  "furniture": "whois.nic.furniture",
  "futbol": "whois.nic.futbol",
  "fyi": "whois.nic.fyi",
  "gallery": "whois.nic.gallery",
  "games": "whois.nic.games",
  "garden": "whois.nic.garden",
  "gift": "whois.nic.gift",
  "gifts": "whois.nic.gifts",
  "glass": "whois.nic.glass",
  "global": "whois.nic.global",
  "gold": "whois.nic.gold",
  "golf": "whois.nic.golf",
  "graphics": "whois.nic.graphics",
  "gratis": "whois.nic.gratis",
  "green": "whois.nic.green",
  "gripe": "whois.nic.gripe",
  "group": "whois.nic.group",
  "guide": "whois.nic.guide",
  "guru": "whois.nic.guru",
  
  // Country code TLDs
  "ac": "whois.nic.ac",
  "ae": "whois.aeda.net.ae",
  "af": "whois.nic.af",
  "ag": "whois.nic.ag",
  "ai": "whois.nic.ai",
  "al": "whois.ripe.net",
  "am": "whois.amnic.net",
  "as": "whois.nic.as",
  "at": "whois.nic.at",
  "au": "whois.auda.org.au",
  "be": "whois.dns.be",
  "bg": "whois.register.bg",
  "bi": "whois.nic.bi",
  "bj": "whois.nic.bj",
  "bo": "whois.nic.bo",
  "br": "whois.registro.br",
  "by": "whois.cctld.by",
  "bz": "whois.afilias-grs.info",
  "ca": "whois.cira.ca",
  "cat": "whois.nic.cat",
  "cc": "ccwhois.verisign-grs.com",
  "cd": "whois.nic.cd",
  "ch": "whois.nic.ch",
  "ci": "whois.nic.ci",
  "ck": "whois.nic.ck",
  "cl": "whois.nic.cl",
  "cn": "whois.cnnic.cn",
  "co": "whois.nic.co",
  "cr": "whois.nic.cr",
  "cx": "whois.nic.cx",
  "cy": "whois.nic.cy",
  "cz": "whois.nic.cz",
  "de": "whois.denic.de",
  "dk": "whois.dk-hostmaster.dk",
  "dm": "whois.nic.dm",
  "do": "whois.nic.do",
  "dz": "whois.nic.dz",
  "ec": "whois.nic.ec",
  "edu": "whois.educause.edu",
  "ee": "whois.tld.ee",
  "eg": "whois.nic.eg",
  "es": "whois.nic.es",
  "eu": "whois.eu",
  "fi": "whois.fi",
  "fj": "whois.nic.fj",
  "fm": "whois.nic.fm",
  "fo": "whois.nic.fo",
  "fr": "whois.nic.fr",
  "ga": "whois.dot.ga",
  "gd": "whois.nic.gd",
  "ge": "whois.nic.ge",
  "gg": "whois.gg",
  "gi": "whois.nic.gi",
  "gl": "whois.nic.gl",
  "gm": "whois.nic.gm",
  "gov": "whois.dotgov.gov",
  "gr": "whois.nic.gr",
  "gs": "whois.nic.gs",
  "gt": "whois.nic.gt",
  "gy": "whois.registry.gy",
  "hk": "whois.hkirc.hk",
  "hm": "whois.registry.hm",
  "hn": "whois.nic.hn",
  "hr": "whois.dns.hr",
  "ht": "whois.nic.ht",
  "hu": "whois.nic.hu",
  "id": "whois.id",
  "ie": "whois.weare.ie",
  "il": "whois.isoc.org.il",
  "im": "whois.nic.im",
  "in": "whois.registry.in",
  "io": "whois.nic.io",
  "iq": "whois.nic.iq",
  "ir": "whois.nic.ir",
  "is": "whois.isnic.is",
  "it": "whois.nic.it",
  "je": "whois.je",
  "jobs": "whois.nic.jobs",
  "jp": "whois.jprs.jp",
  "ke": "whois.kenic.or.ke",
  "kg": "whois.nic.kg",
  "ki": "whois.nic.ki",
  "kr": "whois.kr",
  "kz": "whois.nic.kz",
  "la": "whois.nic.la",
  "li": "whois.nic.li",
  "lk": "whois.nic.lk",
  "lt": "whois.domreg.lt",
  "lu": "whois.dns.lu",
  "lv": "whois.nic.lv",
  "ly": "whois.nic.ly",
  "ma": "whois.registre.ma",
  "md": "whois.nic.md",
  "me": "whois.nic.me",
  "mg": "whois.nic.mg",
  "mil": "whois.nic.mil",
  "mk": "whois.marnet.mk",
  "ml": "whois.dot.ml",
  "mn": "whois.nic.mn",
  "mo": "whois.monic.mo",
  "mobi": "whois.nic.mobi",
  "ms": "whois.nic.ms",
  "mt": "whois.nic.mt",
  "mu": "whois.nic.mu",
  "museum": "whois.museum",
  "mx": "whois.mx",
  "my": "whois.mynic.my",
  "mz": "whois.nic.mz",
  "na": "whois.na-nic.com.na",
  "name": "whois.nic.name",
  "nc": "whois.nc",
  "nf": "whois.nic.nf",
  "ng": "whois.nic.net.ng",
  "nl": "whois.domain-registry.nl",
  "no": "whois.norid.no",
  "nu": "whois.nic.nu",
  "nz": "whois.nic.nz",
  "om": "whois.registry.om",
  "paris": "whois.nic.paris",
  "pe": "kero.yachay.pe",
  "pf": "whois.registry.pf",
  "pl": "whois.dns.pl",
  "pm": "whois.nic.pm",
  "post": "whois.dotpostregistry.net",
  "pr": "whois.nic.pr",
  "pro": "whois.afilias.net",
  "ps": "whois.pnina.ps",
  "pt": "whois.dns.pt",
  "pw": "whois.nic.pw",
  "qa": "whois.registry.qa",
  "re": "whois.nic.re",
  "ro": "whois.rotld.ro",
  "rs": "whois.rnids.rs",
  "ru": "whois.tcinet.ru",
  "sa": "whois.nic.net.sa",
  "sb": "whois.nic.sb",
  "sc": "whois.nic.sc",
  "se": "whois.iis.se",
  "sg": "whois.sgnic.sg",
  "sh": "whois.nic.sh",
  "si": "whois.register.si",
  "sk": "whois.sk-nic.sk",
  "sl": "whois.nic.sl",
  "sm": "whois.nic.sm",
  "sn": "whois.nic.sn",
  "so": "whois.nic.so",
  "st": "whois.nic.st",
  "su": "whois.tcinet.ru",
  "sx": "whois.sx",
  "sy": "whois.tld.sy",
  "tc": "whois.nic.tc",
  "tel": "whois.nic.tel",
  "tf": "whois.nic.tf",
  "th": "whois.thnic.co.th",
  "tj": "whois.nic.tj",
  "tk": "whois.dot.tk",
  "tl": "whois.nic.tl",
  "tm": "whois.nic.tm",
  "tn": "whois.ati.tn",
  "to": "whois.tonic.to",
  "tr": "whois.nic.tr",
  "travel": "whois.nic.travel",
  "tv": "whois.nic.tv",
  "tw": "whois.twnic.net.tw",
  "tz": "whois.tznic.or.tz",
  "ua": "whois.ua",
  "ug": "whois.co.ug",
  "uk": "whois.nic.uk",
  "us": "whois.nic.us",
  "uy": "whois.nic.org.uy",
  "uz": "whois.cctld.uz",
  "vc": "whois.nic.vc",
  "ve": "whois.nic.ve",
  "vg": "whois.nic.vg",
  "vu": "whois.nic.vu",
  "wf": "whois.nic.wf",
  "ws": "whois.website.ws",
  "yt": "whois.nic.yt",
  "zone": "whois.nic.zone",
};

// Function to determine which WHOIS server to use for an IP address
export function getIPWhoisServer(ip: string): string {
  // For now, we just return the default server
  // In a more sophisticated implementation, we could detect the region
  // and return the appropriate RIR
  return IP_WHOIS_SERVERS.default;
}

// Function to determine which WHOIS server to use for a domain
export function getDomainWhoisServer(domain: string): string | null {
  const tld = domain.split('.').pop()?.toLowerCase();
  if (!tld) return null;
  
  return DOMAIN_WHOIS_SERVERS[tld] || null;
}

// Function to check if a query is an IP address
export function isIPAddress(query: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  return ipv4Pattern.test(query) || ipv6Pattern.test(query);
}
