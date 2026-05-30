const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const r = 'C:\\Users\\4513\\.openclaw\\workspace\\jiugong-bagua';
const tmp = 'C:\\Users\\4513\\.openclaw\\workspace\\_tmp_ghpages3';

// 1. 检查out
const html = fs.readFileSync(path.join(r,'out','huangli','index.html'),'utf8');
console.log('老黄历吉时查询:', html.includes('老黄历吉时查询'));
console.log('二十四节气时间表:', html.includes('二十四节气时间表'));

// 2. 清空并创建临时目录
if(fs.existsSync(tmp)) fs.rmSync(tmp,{recursive:true,force:true});
fs.mkdirSync(tmp,{recursive:true});

// 3. 拷贝out到临时目录根
const cp = (src, dest) => {
  fs.mkdirSync(dest,{recursive:true});
  for(const e of fs.readdirSync(src,{withFileTypes:true})) {
    const s=path.join(src,e.name), d=path.join(dest,e.name);
    e.isDirectory()?cp(s,d):fs.copyFileSync(s,d);
  }
};
cp(path.join(r,'out'), tmp);
fs.writeFileSync(path.join(tmp,'.nojekyll'),'');
fs.writeFileSync(path.join(tmp,'CNAME'),'jiugongbagua.com');
console.log('临时文件数:', fs.readdirSync(tmp).length,'index.html存在:',fs.existsSync(path.join(tmp,'index.html')));

// 4. 创建独立git仓库并推送到gh-pages
const run = (cmd) => execSync(cmd, {cwd:tmp, stdio:'pipe'}).toString();
run('git init');
run('git config user.email deploy@bot');
run('git config user.name deploy');
run('git add -A');
run('git commit -m "deploy: huangli v2, laohuangli + jieqi detailed"');
run('git remote add origin https://github.com/fuxing-4513/jiugongbagua.git');
console.log('正在推送...');
run('git push origin HEAD:gh-pages --force');
console.log('推送完成!');

// 5. 验证远程仓库
const sha = execSync('git ls-remote origin refs/heads/gh-pages', {cwd:r, stdio:'pipe'}).toString().trim().split(/\s+/)[0];
console.log('远程 gh-pages SHA:', sha);

// 6. 清理
fs.rmSync(tmp,{recursive:true,force:true});
console.log('✅ 部署成功');
