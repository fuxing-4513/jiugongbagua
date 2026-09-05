// GitHub 检索：五运六气开源测算
const UA = 'Mozilla/5.0';
const queries = [
  ['五运六气', '五运六气 运气 推算'],
  ['运气排盘', 'wuyun liuqi OR 运气盘'],
  ['中医运气学', '中医 运气 OR wuyun traditional chinese medicine'],
];

async function search(q) {
  try {
    const r = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=6`, {
      headers: { 'User-Agent': UA, 'Accept': 'application/vnd.github+json' }, signal: AbortSignal.timeout(20000)
    });
    if (!r.ok) return 'HTTP ' + r.status;
    const j = await r.json();
    const out = [];
    for (const repo of (j.items || [])) {
      const desc = (repo.description || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, 110);
      if (/pdf|百度网盘|ed2k|下载|资源/i.test(desc)) continue;
      out.push(`  ${repo.full_name} ⭐${repo.stargazers_count} [${repo.language || '?'}] ${desc}`);
    }
    return out.length ? out.join('\n') : '  （无有效结果）';
  } catch (e) { return '  检索失败: ' + e.message; }
}

(async () => {
  for (const [label, q] of queries) {
    console.log(`=== ${label} ===`);
    console.log(await search(q));
    console.log('');
  }
})();
