const https=require('https');
const paths=["/bazi/","/hehun/","/chenggu/","/meihua/","/liuyao/","/xingming/","/huangli/","/shengxiao/","/xingzuo/","/ziwei/","/qimen/","/shuma/","/cezi/","/taluo/","/xiaoliuren/","/jiemeng/","/lingqian/","/fengshui/","/wenku/","/experts/"];
https.get({hostname:'www.jiugongbagua.com',path:'/',agent:false,timeout:15000},res=>{
  let d='';
  res.on('data',c=>d+=c);
  res.on('end',()=>{
    console.log('首页板块链接检查:');
    for(const p of paths){
      const name=p.replace(/\//g,'');
      const found=d.includes('"'+name+'"')||d.includes("'"+name+"'")||d.includes('/'+name+'/')||d.includes('href="'+name)||d.includes("href='"+name);
      console.log('  '+name,found?'✅':'❌');
    }
  });
}).on('error',e=>console.log('ERROR:',e.message));
