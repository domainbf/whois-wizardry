
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight CORS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// WHOIS Servers list
$DOMAIN_WHOIS_SERVERS = array(
    // Generic TLDs
    "com" => "whois.verisign-grs.com",
    "net" => "whois.verisign-grs.com",
    "org" => "whois.pir.org",
    "info" => "whois.afilias.net",
    "biz" => "whois.neulevel.biz",
    "mobi" => "whois.dotmobiregistry.net",
    "name" => "whois.nic.name",
    "pro" => "whois.registrypro.pro",
    "edu" => "whois.educause.net",
    "mil" => "whois.nic.mil",
    "gov" => "whois.nic.gov",
    "int" => "whois.isi.edu",
    "ac" => "whois.nic.ac",
    "ae" => "whois.nic.ae",
    "af" => "whois.nic.af",
    "ag" => "whois.nic.ag",
    "ai" => "whois.nic.ai",
    "al" => "whois.ripe.net",
    "am" => "whois.amnic.net",
    "as" => "whois.nic.as",
    "at" => "whois.nic.at",
    "au" => "whois.aunic.net",
    "az" => "whois.ripe.net",
    "ba" => "whois.ripe.net",
    "be" => "whois.dns.be",
    "bg" => "whois.register.bg",
    "bi" => "whois.nic.bi",
    "bj" => "www.nic.bj",
    "br" => "whois.nic.br",
    "bt" => "whois.netnames.net",
    "by" => "whois.ripe.net",
    "bz" => "whois.belizenic.bz",
    "ca" => "whois.cira.ca",
    "cc" => "whois.nic.cc",
    "cd" => "whois.nic.cd",
    "ch" => "whois.nic.ch",
    "ck" => "whois.nic.ck",
    "cl" => "nic.cl",
    "cn" => "whois.cnnic.net.cn",
    "co" => "whois.nic.co",
    "cx" => "whois.nic.cx",
    "cy" => "whois.ripe.net",
    "cz" => "whois.nic.cz",
    "de" => "whois.denic.de",
    "dk" => "whois.dk-hostmaster.dk",
    "dm" => "whois.nic.cx",
    "dz" => "whois.ripe.net",
    "ee" => "whois.eenet.ee",
    "eg" => "whois.ripe.net",
    "es" => "whois.ripe.net",
    "eu" => "whois.eu",
    "fi" => "whois.ficora.fi",
    "fo" => "whois.ripe.net",
    "fr" => "whois.nic.fr",
    "gb" => "whois.ripe.net",
    "ge" => "whois.ripe.net",
    "gl" => "whois.ripe.net",
    "gm" => "whois.ripe.net",
    "gr" => "whois.ripe.net",
    "gs" => "whois.adamsnames.tc",
    "hk" => "whois.hknic.net.hk",
    "hm" => "whois.registry.hm",
    "hn" => "whois2.afilias-grs.net",
    "hr" => "whois.ripe.net",
    "hu" => "whois.ripe.net",
    "ie" => "whois.domainregistry.ie",
    "il" => "whois.isoc.org.il",
    "in" => "whois.inregistry.net",
    "io" => "whois.nic.io",
    "iq" => "vrx.net",
    "ir" => "whois.nic.ir",
    "is" => "whois.isnic.is",
    "it" => "whois.nic.it",
    "je" => "whois.je",
    "jobs" => "jobswhois.verisign-grs.com",
    "jp" => "whois.jprs.jp",
    "kg" => "whois.domain.kg",
    "kr" => "whois.nic.or.kr",
    "la" => "whois2.afilias-grs.net",
    "li" => "whois.nic.li",
    "lt" => "whois.domreg.lt",
    "lu" => "whois.restena.lu",
    "lv" => "whois.nic.lv",
    "ly" => "whois.lydomains.com",
    "ma" => "whois.iam.net.ma",
    "mc" => "whois.ripe.net",
    "md" => "whois.nic.md",
    "me" => "whois.nic.me",
    "mk" => "whois.ripe.net",
    "ms" => "whois.nic.ms",
    "mt" => "whois.ripe.net",
    "mu" => "whois.nic.mu",
    "mx" => "whois.nic.mx",
    "my" => "whois.mynic.net.my",
    "museum" => "whois.museum",
    "nf" => "whois.nic.cx",
    "nl" => "whois.domain-registry.nl",
    "no" => "whois.norid.no",
    "nu" => "whois.nic.nu",
    "nz" => "whois.srs.net.nz",
    "pl" => "whois.dns.pl",
    "pr" => "whois.nic.pr",
    "pt" => "whois.dns.pt",
    "ro" => "whois.rotld.ro",
    "ru" => "whois.ripn.ru",
    "sa" => "saudinic.net.sa",
    "sb" => "whois.nic.net.sb",
    "sc" => "whois2.afilias-grs.net",
    "se" => "whois.nic-se.se",
    "sg" => "whois.nic.net.sg",
    "sh" => "whois.nic.sh",
    "si" => "whois.arnes.si",
    "sk" => "whois.sk-nic.sk",
    "sm" => "whois.ripe.net",
    "st" => "whois.nic.st",
    "su" => "whois.ripn.net",
    "tc" => "whois.adamsnames.tc",
    "tel" => "whois.nic.tel",
    "tf" => "whois.nic.tf",
    "th" => "whois.thnic.net",
    "tj" => "whois.nic.tj",
    "tk" => "whois.nic.tk",
    "tl" => "whois.domains.tl",
    "tm" => "whois.nic.tm",
    "tn" => "whois.ripe.net",
    "to" => "whois.tonic.to",
    "tp" => "whois.domains.tl",
    "tr" => "whois.nic.tr",
    "travel" => "whois.nic.travel",
    "tv" => "whois.nic.tv",
    "tw" => "whois.twnic.net.tw",
    "ua" => "whois.ripe.net",
    "uk" => "whois.nic.uk",
    "us" => "whois.nic.us",
    "uy" => "nic.uy",
    "uz" => "whois.cctld.uz",
    "va" => "whois.ripe.net",
    "vc" => "whois2.afilias-grs.net",
    "ve" => "whois.nic.ve",
    "vg" => "whois.adamsnames.tc",
    "ws" => "www.nic.ws",
    "yu" => "whois.ripe.net",
    
    // Special cases for second-level domains
    "co.uk" => "whois.nic.uk",
    "org.uk" => "whois.nic.uk",
    "gov.uk" => "whois.ja.net",
    "ac.uk" => "whois.ja.net",
    "net.uk" => "whois.nic.uk",
    "net.cn" => "whois.cnnic.net.cn",   
    "com.cn" => "whois.cnnic.net.cn",
    "gov.cn" => "whois.cnnic.net.cn",
    "edu.cn" => "whois.edu.cn",
    "net.au" => "whois.aunic.net",
    
    // CentralNIC domains
    "ae.com" => "whois.centralnic.net",
    "br.com" => "whois.centralnic.net",
    "cn.com" => "whois.centralnic.net",
    "de.com" => "whois.centralnic.net",
    "eu.com" => "whois.centralnic.net",
    "gb.com" => "whois.centralnic.net",
    "hu.com" => "whois.centralnic.net",    
    "jpn.com" => "whois.centralnic.net",
    "kr.com" => "whois.centralnic.net",
    "no.com" => "whois.centralnic.net",
    "qc.com" => "whois.centralnic.net",
    "ru.com" => "whois.centralnic.net",
    "sa.com" => "whois.centralnic.net",
    "se.com" => "whois.centralnic.net",    
    "uk.com" => "whois.centralnic.net",    
    "us.com" => "whois.centralnic.net",
    "uy.com" => "whois.centralnic.net",    
    "za.com" => "whois.centralnic.net",
    "gb.net" => "whois.centralnic.net",
    "se.net" => "whois.centralnic.net",
    "uk.net" => "whois.centralnic.net",
    
    // Additional zones
    "za.net" => "whois.za.net",
    "za.org" => "whois.za.net",
    
    // New gTLDs
    "xyz" => "whois.nic.xyz",
    "top" => "whois.nic.top",
    "vip" => "whois.nic.vip",
    "club" => "whois.nic.club",
    "shop" => "whois.nic.shop",
    "wang" => "whois.gtld.knet.cn",
    "xin" => "whois.gtld.knet.cn",
    "site" => "whois.nic.site",
    "ltd" => "whois.gtld.knet.cn",
    "online" => "whois.nic.online",
    "asia" => "whois.nic.asia",
    "app" => "whois.nic.google",
    "dev" => "whois.nic.google",
    "coop" => "whois.nic.coop",
);

// IP WHOIS servers
$IP_WHOIS_SERVERS = array(
    "default" => "whois.iana.org",
    "arin" => "whois.arin.net",      // North America
    "ripe" => "whois.ripe.net",      // Europe, Middle East, Central Asia
    "apnic" => "whois.apnic.net",    // Asia Pacific
    "afrinic" => "whois.afrinic.net",// Africa
    "lacnic" => "whois.lacnic.net",  // Latin America and Caribbean
);

// Function to check if a query is an IP address
function isIPAddress($query) {
    // IPv4 pattern
    $ipv4Pattern = '/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/';
    
    // IPv6 pattern (simplified)
    $ipv6Pattern = '/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/';
    
    return preg_match($ipv4Pattern, $query) || preg_match($ipv6Pattern, $query);
}

// Function to validate domain
function validateDomain($domain) {
    if (substr($domain, 0, 6) == 'whois.') {
        return false;
    }
    return preg_match('/^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z0-9-_.]+$/', $domain);
}

// Function to perform WHOIS lookup
function performWhoisLookup($server, $query) {
    // Add special handling for Verisign servers
    $query_prefix = '';
    if (strpos($server, 'verisign-grs.com') !== false) {
        $query_prefix = 'domain ';
    }
    
    $fp = @fsockopen($server, 43, $errno, $errstr, 10);
    if (!$fp) {
        return array('error' => "无法连接到WHOIS服务器: $errno - $errstr");
    }
    
    fputs($fp, $query_prefix . $query . "\r\n");
    $data = '';
    while (!feof($fp)) {
        $data .= fgets($fp, 4096);
    }
    fclose($fp);
    
    return $data;
}

// Function to extract domain WHOIS data
function extractDomainWhoisData($rawData) {
    if (!$rawData || !is_string($rawData)) {
        return array('error' => 'Invalid WHOIS raw data');
    }
    
    $data = array();
    
    // Check if this is an error response
    if (strpos($rawData, 'No match for domain') !== false || 
        strpos($rawData, 'No match for') !== false || 
        strpos($rawData, 'NOT FOUND') !== false ||
        strpos($rawData, 'No Data Found') !== false ||
        strpos($rawData, 'Domain not found') !== false) {
        return array('error' => '域名未注册或无法获取信息');
    }
    
    // Normalize line endings and remove extra spaces
    $normalizedData = preg_replace('/\r\n/', "\n", $rawData);
    $normalizedData = preg_replace('/\n+/', "\n", $normalizedData);
    
    // Handle Verisign (.com, .net) responses
    if (strpos($rawData, 'Whois Server Version 2.0') !== false || 
        strpos($rawData, 'whois.verisign-grs.com') !== false) {
        
        // Extract domain information
        if (preg_match('/Domain Name:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['domainName'] = trim($matches[1]);
        }
        
        // Extract registrar information
        if (preg_match('/Registrar:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['registrar'] = trim($matches[1]);
        }
        
        // Extract dates
        if (preg_match('/Creation Date:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['creationDate'] = trim($matches[1]);
        }
        
        if (preg_match('/Updated Date:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['updatedDate'] = trim($matches[1]);
        }
        
        if (preg_match('/Registry Expiry Date:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches) || 
            preg_match('/Registrar Registration Expiration Date:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['expirationDate'] = trim($matches[1]);
        }
        
        // Extract name servers
        $nameServers = array();
        preg_match_all('/Name Server:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches);
        if (!empty($matches[1])) {
            foreach ($matches[1] as $ns) {
                $trimmed = trim($ns);
                if ($trimmed) {
                    $nameServers[] = strtolower($trimmed);
                }
            }
        }
        if (!empty($nameServers)) {
            $data['nameServers'] = $nameServers;
        }
        
        // Extract domain status
        $statusValues = array();
        preg_match_all('/Domain Status:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches);
        if (!empty($matches[1])) {
            foreach ($matches[1] as $status) {
                $trimmed = trim($status);
                if ($trimmed) {
                    $statusValues[] = $trimmed;
                }
            }
        }
        if (!empty($statusValues)) {
            $data['status'] = $statusValues;
        }
    }
    // For Chinese domains (.cn)
    else if (strpos($normalizedData, 'CNNIC WHOIS') !== false || 
             strpos($normalizedData, '域名信息') !== false || 
             strpos($normalizedData, '注册商') !== false) {
        
        // Try specific Chinese patterns
        if (preg_match('/注册商:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches) || 
            preg_match('/Registrar:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['registrar'] = trim($matches[1]);
        }
        
        if (preg_match('/注册时间:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches) || 
            preg_match('/Registration Date:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches) ||
            preg_match('/注册日期:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['creationDate'] = trim($matches[1]);
        }
        
        if (preg_match('/过期时间:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches) || 
            preg_match('/Expiration Date:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches) ||
            preg_match('/到期日期:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['expirationDate'] = trim($matches[1]);
        }
        
        // Extract name servers
        $nameServers = array();
        preg_match_all('/DNS服务器:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches);
        if (!empty($matches[1])) {
            foreach ($matches[1] as $ns) {
                $trimmed = trim($ns);
                if ($trimmed) {
                    $nameServers[] = strtolower($trimmed);
                }
            }
        }
        
        if (empty($nameServers)) {
            // Try alternative pattern
            preg_match_all('/Name Server:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches);
            if (!empty($matches[1])) {
                foreach ($matches[1] as $ns) {
                    $trimmed = trim($ns);
                    if ($trimmed) {
                        $nameServers[] = strtolower($trimmed);
                    }
                }
            }
        }
        
        if (!empty($nameServers)) {
            $data['nameServers'] = $nameServers;
        }
        
        // Extract status
        if (preg_match('/状态:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches) ||
            preg_match('/Domain Status:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['status'] = trim($matches[1]);
        }
    }
    // General case for other WHOIS formats
    else {
        // Domain name
        if (preg_match('/Domain Name:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches)) {
            $data['domainName'] = trim($matches[1]);
        }
        
        // Registrar patterns
        $registrarPatterns = array(
            '/Registrar:\s*(.+?)(?:\n|$)/i',
            '/Registrar Name:\s*(.+?)(?:\n|$)/i',
            '/Sponsoring Registrar:\s*(.+?)(?:\n|$)/i',
            '/Registration Service Provider:\s*(.+?)(?:\n|$)/i',
            '/Sponsoring Registrar Organization:\s*(.+?)(?:\n|$)/i',
            '/Registrant:\s*(.+?)(?:\n|$)/i',
            '/Holder:\s*(.+?)(?:\n|$)/i'
        );
        
        foreach ($registrarPatterns as $pattern) {
            if (preg_match($pattern, $normalizedData, $matches)) {
                $data['registrar'] = trim($matches[1]);
                break;
            }
        }
        
        // Creation date patterns
        $creationPatterns = array(
            '/Creation Date:\s*(.+?)(?:\n|$)/i',
            '/Created:\s*(.+?)(?:\n|$)/i',
            '/Created On:\s*(.+?)(?:\n|$)/i',
            '/Created Date:\s*(.+?)(?:\n|$)/i',
            '/Registration Date:\s*(.+?)(?:\n|$)/i',
            '/Domain Registration Date:\s*(.+?)(?:\n|$)/i',
            '/Domain Create Date:\s*(.+?)(?:\n|$)/i',
            '/Registration Time:\s*(.+?)(?:\n|$)/i',
            '/Registered on:\s*(.+?)(?:\n|$)/i',
            '/registered:\s*(.+?)(?:\n|$)/i'
        );
        
        foreach ($creationPatterns as $pattern) {
            if (preg_match($pattern, $normalizedData, $matches)) {
                $data['creationDate'] = trim($matches[1]);
                break;
            }
        }
        
        // Expiration date patterns
        $expirationPatterns = array(
            '/Expiration Date:\s*(.+?)(?:\n|$)/i',
            '/Registry Expiry Date:\s*(.+?)(?:\n|$)/i',
            '/Expiry Date:\s*(.+?)(?:\n|$)/i',
            '/Registrar Registration Expiration Date:\s*(.+?)(?:\n|$)/i',
            '/Domain Expiration Date:\s*(.+?)(?:\n|$)/i',
            '/Expires On:\s*(.+?)(?:\n|$)/i',
            '/Expires:\s*(.+?)(?:\n|$)/i',
            '/Expiry:\s*(.+?)(?:\n|$)/i',
            '/expire:\s*(.+?)(?:\n|$)/i'
        );
        
        foreach ($expirationPatterns as $pattern) {
            if (preg_match($pattern, $normalizedData, $matches)) {
                $data['expirationDate'] = trim($matches[1]);
                break;
            }
        }
        
        // Updated date patterns
        $updatedPatterns = array(
            '/Updated Date:\s*(.+?)(?:\n|$)/i',
            '/Last Updated On:\s*(.+?)(?:\n|$)/i',
            '/Last Modified:\s*(.+?)(?:\n|$)/i',
            '/Last Update:\s*(.+?)(?:\n|$)/i',
            '/Updated:\s*(.+?)(?:\n|$)/i',
            '/modified:\s*(.+?)(?:\n|$)/i'
        );
        
        foreach ($updatedPatterns as $pattern) {
            if (preg_match($pattern, $normalizedData, $matches)) {
                $data['updatedDate'] = trim($matches[1]);
                break;
            }
        }
        
        // Extract name servers
        $nameServers = array();
        
        // Try different name server patterns
        $nsPatterns = array(
            '/Name Server:\s*(.+?)(?:\n|$)/i',
            '/nserver:\s*(.+?)(?:\n|$)/i',
            '/Name Servers:\s*(.+?)(?:\n|$)/i',
            '/Nameservers:\s*(.+?)(?:\n|$)/i',
            '/DNS:\s*(.+?)(?:\n|$)/i'
        );
        
        foreach ($nsPatterns as $pattern) {
            preg_match_all($pattern, $normalizedData, $matches);
            if (!empty($matches[1])) {
                foreach ($matches[1] as $ns) {
                    $trimmed = trim($ns);
                    if ($trimmed) {
                        $nameServers[] = strtolower($trimmed);
                    }
                }
                if (!empty($nameServers)) break;
            }
        }
        
        // Special case: if name servers are listed in a block
        if (empty($nameServers)) {
            if (preg_match('/Name Servers:([\s\S]*?)(?:\n\n|\n[^\s]|$)/i', $normalizedData, $nsBlockMatch)) {
                $nsBlock = trim($nsBlockMatch[1]);
                $nsLines = explode("\n", $nsBlock);
                foreach ($nsLines as $line) {
                    $trimmedLine = trim($line);
                    if ($trimmedLine && strpos($trimmedLine, '.') !== false) {
                        $nameServers[] = strtolower($trimmedLine);
                    }
                }
            }
        }
        
        if (!empty($nameServers)) {
            $data['nameServers'] = $nameServers;
        }
        
        // Extract status
        $statusValues = array();
        preg_match_all('/Domain Status:\s*(.+?)(?:\n|$)/i', $normalizedData, $matches);
        if (!empty($matches[1])) {
            foreach ($matches[1] as $status) {
                $trimmed = trim($status);
                if ($trimmed) {
                    $statusValues[] = $trimmed;
                }
            }
        }
        
        if (empty($statusValues)) {
            $statusPatterns = array(
                '/Status:\s*(.+?)(?:\n|$)/i',
                '/Domain Status:\s*(.+?)(?:\n|$)/i'
            );
            
            foreach ($statusPatterns as $pattern) {
                if (preg_match($pattern, $normalizedData, $matches)) {
                    $statusValues[] = trim($matches[1]);
                    break;
                }
            }
        }
        
        if (!empty($statusValues)) {
            $data['status'] = $statusValues;
        }
    }
    
    return $data;
}

// Function to extract IP WHOIS data
function extractIPWhoisData($rawData) {
    $data = array();
    
    if (preg_match('/NetRange:\s*(.+?)(?:\n|$)/i', $rawData, $matches) || 
        preg_match('/inetnum:\s*(.+?)(?:\n|$)/i', $rawData, $matches)) {
        $data['range'] = trim($matches[1]);
    }
    
    if (preg_match('/Organization:\s*(.+?)(?:\n|$)/i', $rawData, $matches) || 
        preg_match('/org-name:\s*(.+?)(?:\n|$)/i', $rawData, $matches) || 
        preg_match('/OrgName:\s*(.+?)(?:\n|$)/i', $rawData, $matches)) {
        $data['organization'] = trim($matches[1]);
    }
    
    if (preg_match('/Country:\s*(.+?)(?:\n|$)/i', $rawData, $matches) || 
        preg_match('/country:\s*(.+?)(?:\n|$)/i', $rawData, $matches)) {
        $data['country'] = trim($matches[1]);
    }
    
    if (preg_match('/CIDR:\s*(.+?)(?:\n|$)/i', $rawData, $matches) || 
        preg_match('/cidr:\s*(.+?)(?:\n|$)/i', $rawData, $matches)) {
        $data['cidr'] = trim($matches[1]);
    }
    
    if (preg_match('/RegDate:\s*(.+?)(?:\n|$)/i', $rawData, $matches) || 
        preg_match('/created:\s*(.+?)(?:\n|$)/i', $rawData, $matches)) {
        $data['created'] = trim($matches[1]);
    }
    
    if (preg_match('/Updated:\s*(.+?)(?:\n|$)/i', $rawData, $matches) || 
        preg_match('/last-modified:\s*(.+?)(?:\n|$)/i', $rawData, $matches)) {
        $data['updated'] = trim($matches[1]);
    }
    
    return $data;
}

// Main logic
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(array('error' => '仅支持GET请求'));
    exit;
}

// Get query parameters
$query = isset($_GET['query']) ? trim($_GET['query']) : '';
$type = isset($_GET['type']) ? $_GET['type'] : 'domain';
$server = isset($_GET['server']) ? $_GET['server'] : null;

if (empty($query)) {
    http_response_code(400);
    echo json_encode(array('error' => '请提供查询参数'));
    exit;
}

// Clean and prepare query
if ($type === 'domain') {
    // Remove http://, https://, www. prefixes
    $query = preg_replace('/^(https?:\/\/)?(www\.)?/i', '', $query);
    // Remove paths, query strings, and fragments
    $query = explode('/', $query)[0];
    $query = explode('?', $query)[0];
    $query = explode('#', $query)[0];
    
    // Validate domain format
    if (!validateDomain($query)) {
        http_response_code(400);
        echo json_encode(array('error' => '请输入有效的域名格式 (例如: example.com)'));
        exit;
    }
    
    // Determine WHOIS server
    if (!$server) {
        // Try second-level domain first
        $parts = explode('.', $query);
        if (count($parts) >= 2) {
            $secondLevel = $parts[count($parts) - 2] . '.' . $parts[count($parts) - 1];
            if (isset($DOMAIN_WHOIS_SERVERS[$secondLevel])) {
                $server = $DOMAIN_WHOIS_SERVERS[$secondLevel];
            } else {
                // Try top-level domain
                $tld = end($parts);
                if (isset($DOMAIN_WHOIS_SERVERS[$tld])) {
                    $server = $DOMAIN_WHOIS_SERVERS[$tld];
                } else {
                    http_response_code(400);
                    echo json_encode(array('error' => "不支持查询 .{$tld} 类型的域名"));
                    exit;
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(array('error' => '无效的域名格式'));
            exit;
        }
    }
} else if ($type === 'ip') {
    // Validate IP address
    if (!isIPAddress($query)) {
        http_response_code(400);
        echo json_encode(array('error' => '请输入有效的IP地址格式'));
        exit;
    }
    
    // Use default IP WHOIS server if not specified
    if (!$server) {
        $server = $IP_WHOIS_SERVERS['default'];
    }
} else {
    http_response_code(400);
    echo json_encode(array('error' => '不支持的查询类型'));
    exit;
}

try {
    // Perform WHOIS lookup
    $rawData = performWhoisLookup($server, $query);
    
    // Check if lookup returned an error
    if (is_array($rawData) && isset($rawData['error'])) {
        http_response_code(500);
        echo json_encode($rawData);
        exit;
    }
    
    // Extract and format data based on type
    if ($type === 'domain') {
        $extractedData = extractDomainWhoisData($rawData);
        
        // Check if extraction returned an error
        if (isset($extractedData['error'])) {
            http_response_code(404);
            echo json_encode(array(
                'error' => $extractedData['error'],
                'rawData' => $rawData
            ));
            exit;
        }
        
        $response = array(
            'domain' => $query,
            'type' => 'domain',
            'data' => array(
                'registrar' => isset($extractedData['registrar']) ? $extractedData['registrar'] : '未知',
                'creationDate' => isset($extractedData['creationDate']) ? $extractedData['creationDate'] : '未知',
                'expirationDate' => isset($extractedData['expirationDate']) ? $extractedData['expirationDate'] : '未知',
                'updatedDate' => isset($extractedData['updatedDate']) ? $extractedData['updatedDate'] : '未知',
                'status' => isset($extractedData['status']) ? $extractedData['status'] : '未知',
                'nameServers' => isset($extractedData['nameServers']) ? $extractedData['nameServers'] : array()
            ),
            'rawData' => $rawData
        );
    } else {
        $extractedData = extractIPWhoisData($rawData);
        
        $response = array(
            'ip' => $query,
            'type' => 'ip',
            'data' => array(
                'range' => isset($extractedData['range']) ? $extractedData['range'] : '未知',
                'organization' => isset($extractedData['organization']) ? $extractedData['organization'] : '未知',
                'country' => isset($extractedData['country']) ? $extractedData['country'] : '未知',
                'cidr' => isset($extractedData['cidr']) ? $extractedData['cidr'] : '未知',
                'created' => isset($extractedData['created']) ? $extractedData['created'] : '未知',
                'updated' => isset($extractedData['updated']) ? $extractedData['updated'] : '未知'
            ),
            'rawData' => $rawData
        );
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'error' => '查询WHOIS服务器时出错: ' . $e->getMessage(),
        'details' => $e->getTraceAsString()
    ));
}
