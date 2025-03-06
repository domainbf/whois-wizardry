
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WHOIS 查询工具</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 4px;
        }
        
        button:hover {
            background-color: #45a049;
        }
        
        #loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }
        
        #result {
            margin-top: 20px;
            display: none;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        .result-group {
            margin-bottom: 15px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
        }
        
        .result-group h3 {
            margin-top: 0;
        }
        
        .error {
            color: #d9534f;
            background-color: #f9f2f2;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
        
        pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 14px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>WHOIS 查询工具</h1>
        <p>查询域名和IP地址的详细信息，包括注册信息、到期时间、IP归属等</p>
        
        <div class="form-group">
            <label for="query">域名或IP地址:</label>
            <input type="text" id="query" placeholder="例如: example.com 或 8.8.8.8">
        </div>
        
        <button id="submit-btn">查询</button>
        
        <div id="error" class="error"></div>
        
        <div id="loading">
            <p>正在查询WHOIS服务器，请稍候...</p>
        </div>
        
        <div id="result">
            <div id="domain-result" style="display: none;">
                <div class="result-group">
                    <h3>域名信息</h3>
                    <div id="domain-info"></div>
                </div>
                
                <div class="result-group" id="nameserver-section">
                    <h3>域名服务器</h3>
                    <div id="nameserver-info"></div>
                </div>
                
                <div class="result-group">
                    <h3>原始WHOIS数据</h3>
                    <pre id="raw-data"></pre>
                </div>
            </div>
            
            <div id="ip-result" style="display: none;">
                <div class="result-group">
                    <h3>IP地址信息</h3>
                    <div id="ip-info"></div>
                </div>
                
                <div class="result-group">
                    <h3>原始WHOIS数据</h3>
                    <pre id="ip-raw-data"></pre>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById('submit-btn').addEventListener('click', function() {
            const query = document.getElementById('query').value.trim();
            
            if (!query) {
                showError('请输入域名或IP地址');
                return;
            }
            
            // 确定查询类型
            const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(query) || 
                          /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(query);
            
            const type = isIP ? 'ip' : 'domain';
            
            // 隐藏之前的结果和错误
            hideError();
            document.getElementById('result').style.display = 'none';
            document.getElementById('domain-result').style.display = 'none';
            document.getElementById('ip-result').style.display = 'none';
            
            // 显示加载状态
            document.getElementById('loading').style.display = 'block';
            
            // 发送API请求
            fetch(`api/whois.php?query=${encodeURIComponent(query)}&type=${type}`)
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.error || '查询失败');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    // 隐藏加载状态
                    document.getElementById('loading').style.display = 'none';
                    
                    // 显示结果区域
                    document.getElementById('result').style.display = 'block';
                    
                    if (data.type === 'domain') {
                        displayDomainResult(data);
                    } else {
                        displayIPResult(data);
                    }
                })
                .catch(error => {
                    // 隐藏加载状态
                    document.getElementById('loading').style.display = 'none';
                    showError(error.message);
                });
        });
        
        function displayDomainResult(data) {
            document.getElementById('domain-result').style.display = 'block';
            
            // 填充域名信息
            let domainInfoHTML = `
                <p><strong>域名:</strong> ${data.domain}</p>
                <p><strong>注册商:</strong> ${data.data.registrar}</p>
                <p><strong>注册时间:</strong> ${formatDate(data.data.creationDate)}</p>
                <p><strong>到期时间:</strong> ${formatDate(data.data.expirationDate)}</p>
                <p><strong>更新时间:</strong> ${formatDate(data.data.updatedDate)}</p>
                <p><strong>状态:</strong> ${formatStatus(data.data.status)}</p>
            `;
            
            document.getElementById('domain-info').innerHTML = domainInfoHTML;
            
            // 填充域名服务器信息
            if (data.data.nameServers && data.data.nameServers.length > 0) {
                let nameserverHTML = '<ul>';
                data.data.nameServers.forEach(function(ns) {
                    nameserverHTML += `<li>${ns}</li>`;
                });
                nameserverHTML += '</ul>';
                document.getElementById('nameserver-info').innerHTML = nameserverHTML;
                document.getElementById('nameserver-section').style.display = 'block';
            } else {
                document.getElementById('nameserver-section').style.display = 'none';
            }
            
            // 填充原始数据
            document.getElementById('raw-data').textContent = data.rawData;
        }
        
        function displayIPResult(data) {
            document.getElementById('ip-result').style.display = 'block';
            
            // 填充IP信息
            let ipInfoHTML = `
                <p><strong>IP地址:</strong> ${data.ip}</p>
                <p><strong>IP范围:</strong> ${data.data.range}</p>
                <p><strong>CIDR:</strong> ${data.data.cidr}</p>
                <p><strong>组织:</strong> ${data.data.organization}</p>
                <p><strong>国家/地区:</strong> ${data.data.country}</p>
                <p><strong>分配时间:</strong> ${formatDate(data.data.created)}</p>
                <p><strong>更新时间:</strong> ${formatDate(data.data.updated)}</p>
            `;
            
            document.getElementById('ip-info').innerHTML = ipInfoHTML;
            
            // 填充原始数据
            document.getElementById('ip-raw-data').textContent = data.rawData;
        }
        
        function formatDate(dateString) {
            if (!dateString || dateString === '未知') return '未知';
            
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    return dateString;
                }
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } catch (e) {
                return dateString;
            }
        }
        
        function formatStatus(status) {
            if (!status) return '未知';
            
            if (Array.isArray(status)) {
                return status.join(', ');
            }
            
            return status;
        }
        
        function showError(message) {
            const errorEl = document.getElementById('error');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
        
        function hideError() {
            document.getElementById('error').style.display = 'none';
        }
    </script>
</body>
</html>
