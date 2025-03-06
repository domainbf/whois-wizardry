
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
  "biz": "whois.neulevel.biz",
  "mobi": "whois.dotmobiregistry.net",
  "name": "whois.nic.name",
  "pro": "whois.registrypro.pro",
  "edu": "whois.educause.net",
  "mil": "whois.nic.mil",
  "gov": "whois.nic.gov",
  "int": "whois.isi.edu",
  "ac": "whois.nic.ac",
  "ae": "whois.nic.ae",
  "af": "whois.nic.af",
  "ag": "whois.nic.ag",
  "ai": "whois.nic.ai",
  "al": "whois.ripe.net",
  "am": "whois.amnic.net",
  "as": "whois.nic.as",
  "at": "whois.nic.at",
  "au": "whois.aunic.net",
  "az": "whois.ripe.net",
  "ba": "whois.ripe.net",
  "be": "whois.dns.be",
  "bg": "whois.register.bg",
  "bi": "whois.nic.bi",
  "bj": "www.nic.bj",
  "br": "whois.nic.br",
  "bt": "whois.netnames.net",
  "by": "whois.ripe.net",
  "bz": "whois.belizenic.bz",
  "ca": "whois.cira.ca",
  "cc": "whois.nic.cc",
  "cd": "whois.nic.cd",
  "ch": "whois.nic.ch",
  "ck": "whois.nic.ck",
  "cl": "nic.cl",
  "cn": "whois.cnnic.net.cn",
  "co": "whois.nic.co",
  "cx": "whois.nic.cx",
  "cy": "whois.ripe.net",
  "cz": "whois.nic.cz",
  "de": "whois.denic.de",
  "dk": "whois.dk-hostmaster.dk",
  "dm": "whois.nic.cx",
  "dz": "whois.ripe.net",
  "ee": "whois.eenet.ee",
  "eg": "whois.ripe.net",
  "es": "whois.ripe.net",
  "eu": "whois.eu",
  "fi": "whois.ficora.fi",
  "fo": "whois.ripe.net",
  "fr": "whois.nic.fr",
  "gb": "whois.ripe.net",
  "ge": "whois.ripe.net",
  "gl": "whois.ripe.net",
  "gm": "whois.ripe.net",
  "gr": "whois.ripe.net",
  "gs": "whois.adamsnames.tc",
  "hk": "whois.hknic.net.hk",
  "hm": "whois.registry.hm",
  "hn": "whois2.afilias-grs.net",
  "hr": "whois.ripe.net",
  "hu": "whois.ripe.net",
  "ie": "whois.domainregistry.ie",
  "il": "whois.isoc.org.il",
  "in": "whois.inregistry.net",
  "io": "whois.nic.io",
  "iq": "vrx.net",
  "ir": "whois.nic.ir",
  "is": "whois.isnic.is",
  "it": "whois.nic.it",
  "je": "whois.je",
  "jobs": "jobswhois.verisign-grs.com",
  "jp": "whois.jprs.jp",
  "kg": "whois.domain.kg",
  "kr": "whois.nic.or.kr",
  "la": "whois2.afilias-grs.net",
  "li": "whois.nic.li",
  "lt": "whois.domreg.lt",
  "lu": "whois.restena.lu",
  "lv": "whois.nic.lv",
  "ly": "whois.lydomains.com",
  "ma": "whois.iam.net.ma",
  "mc": "whois.ripe.net",
  "md": "whois.nic.md",
  "me": "whois.nic.me",
  "mk": "whois.ripe.net",
  "ms": "whois.nic.ms",
  "mt": "whois.ripe.net",
  "mu": "whois.nic.mu",
  "mx": "whois.nic.mx",
  "my": "whois.mynic.net.my",
  "museum": "whois.museum",
  "nf": "whois.nic.cx",
  "nl": "whois.domain-registry.nl",
  "no": "whois.norid.no",
  "nu": "whois.nic.nu",
  "nz": "whois.srs.net.nz",
  "pl": "whois.dns.pl",
  "pr": "whois.nic.pr",
  "pt": "whois.dns.pt",
  "ro": "whois.rotld.ro",
  "ru": "whois.ripn.ru",
  "sa": "saudinic.net.sa",
  "sb": "whois.nic.net.sb",
  "sc": "whois2.afilias-grs.net",
  "se": "whois.nic-se.se",
  "sg": "whois.nic.net.sg",
  "sh": "whois.nic.sh",
  "si": "whois.arnes.si",
  "sk": "whois.sk-nic.sk",
  "sm": "whois.ripe.net",
  "st": "whois.nic.st",
  "su": "whois.ripn.net",
  "tc": "whois.adamsnames.tc",
  "tel": "whois.nic.tel",
  "tf": "whois.nic.tf",
  "th": "whois.thnic.net",
  "tj": "whois.nic.tj",
  "tk": "whois.nic.tk",
  "tl": "whois.domains.tl",
  "tm": "whois.nic.tm",
  "tn": "whois.ripe.net",
  "to": "whois.tonic.to",
  "tp": "whois.domains.tl",
  "tr": "whois.nic.tr",
  "travel": "whois.nic.travel",
  "tv": "whois.nic.tv",
  "tw": "whois.twnic.net.tw",
  "ua": "whois.ripe.net",
  "uk": "whois.nic.uk",
  "us": "whois.nic.us",
  "uy": "nic.uy",
  "uz": "whois.cctld.uz",
  "va": "whois.ripe.net",
  "vc": "whois2.afilias-grs.net",
  "ve": "whois.nic.ve",
  "vg": "whois.adamsnames.tc",
  "ws": "www.nic.ws",
  "yu": "whois.ripe.net",
  
  // Special cases for second-level domains
  "co.uk": "whois.nic.uk",
  "org.uk": "whois.nic.uk",
  "gov.uk": "whois.ja.net",
  "ac.uk": "whois.ja.net",
  "net.uk": "whois.nic.uk",
  "net.cn": "whois.cnnic.net.cn",   
  "com.cn": "whois.cnnic.net.cn",
  "gov.cn": "whois.cnnic.net.cn",
  "edu.cn": "whois.edu.cn",
  
  // CentralNIC domains
  "ae.com": "whois.centralnic.net",
  "br.com": "whois.centralnic.net",
  "cn.com": "whois.centralnic.net",
  "de.com": "whois.centralnic.net",
  "eu.com": "whois.centralnic.net",
  "gb.com": "whois.centralnic.net",
  "hu.com": "whois.centralnic.net",    
  "jpn.com": "whois.centralnic.net",
  "kr.com": "whois.centralnic.net",
  "no.com": "whois.centralnic.net",
  "qc.com": "whois.centralnic.net",
  "ru.com": "whois.centralnic.net",
  "sa.com": "whois.centralnic.net",
  "se.com": "whois.centralnic.net",    
  "uk.com": "whois.centralnic.net",    
  "us.com": "whois.centralnic.net",
  "uy.com": "whois.centralnic.net",    
  "za.com": "whois.centralnic.net",
  "gb.net": "whois.centralnic.net",
  "se.net": "whois.centralnic.net",
  "uk.net": "whois.centralnic.net",
  
  // Additional zones
  "za.net": "whois.za.net",
  "za.org": "whois.za.net",
  
  // New gTLDs
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
  "asia": "whois.nic.asia",
  "app": "whois.nic.google",
  "dev": "whois.nic.google",
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
  // First try to match full domain (for second-level domains like co.uk)
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const secondLevel = parts[parts.length - 2] + '.' + parts[parts.length - 1];
    if (DOMAIN_WHOIS_SERVERS[secondLevel]) {
      return DOMAIN_WHOIS_SERVERS[secondLevel];
    }
  }
  
  // Then try top-level domain
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
