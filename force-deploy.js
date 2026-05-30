const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const r = 'C:\\Users\\4513\\.openclaw\\workspace\\jiugong-bagua';
const tmp = 'C:\\Users\\4513\\.openclaw\\workspace\\_tmp_ghpages2';

// 1. 检查构建产物
if(!fs.existsSync(path.join(r,'out','huangli','index.html'))) {
  console.log('out不存在，重建...');
  execSync('npx next build',{cwd:r,stdio:'pipe',timeout:120000});
}
const html=fs.readFileSync(path.join(r,'out','huangli','index.html'),'utf8');
console.log('老黄历吉时查询:', html.includes('老黄历吉时查询'));
console.log('二十四节气时间表:', html.includes('二十四节气时间表'));

// 2. 清空临时目录
if(fs.existsSync(tmp)) fs.rmSync(tmp,{recursive:true,force:true});
fs.mkdirSync(tmp,{recursive:true});

// 3. 拷贝out内容
const cp=(src,dest)=>{
  fs.mkdirSync(dest,{recursive:true});
  for(const e of fs.readdirSync(src,{withFileTypes:true})) {
    const s=path.join(src,e.name),d=path.join(dest,e.name);
    e.isDirectory()?cp(s,d):fs.copyFileSync(s,d);
  }
};
cp(path.join(r,'out'),tmp);
fs.writeFileSync(path.join(tmp,'.nojekyll'),'');
fs.writeFileSync(path.join(tmp,'CNAME'),'jiugongbagua.com');
console.log('临时目录文件数:', fs.readdirSync(tmp).length);

// 4. 在临时目录建立独立git repo并推送
execSync('git init',{cwd:tmp,stdio:'pipe'});
execSync('git config user.email deploy@bot',{cwd:tmp,stdio:'pipe'});
execSync('git config user.name deploy',{cwd:tmp,stdio:'pipe'});
execSync('git add -A',{cwd:tmp,stdio:'pipe'});
execSync('git commit -m "deploy: huangli v2 full rebuild"',{cwd:tmp,stdio:'pipe'});
console.log('推送至 gh-pages...');
execSync('git remote add origin https://github.com/fuxing-4513/jiugongbagua.git',{cwd:tmp,stdio:'pipe'});
execSync('git push origin HEAD:gh-pages --force',{cwd:tmp,stdio:'pipe'});
console.log('推送成功!');

// 5. 清理
fs.rmSync(tmp,{recursive:true,force:true});

// 6. 验证
execSync('git fetch origin gh-pages',{cwd:r,stdio:'pipe'});
const sha=execSync('git rev-parse origin/gh-pages',{cwd:r,stdio:'pipe'}).toString().trim();
console.log('远程 gh-pages HEAD:', sha);
