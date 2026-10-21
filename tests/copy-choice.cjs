module.exports=async function copyChoice(page){
 await page.context().grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(page.url()).origin});
 await page.getByRole('button',{name:'Copy settings to clipboard',exact:true}).click();
 await page.getByRole('button',{name:'Copied!',exact:true}).waitFor();
 const text=(await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n');
 if(!text.startsWith('Use $create-explainer'))throw Error('Clipboard request is missing');
 const match=text.match(/```json\n([\s\S]*?)\n```/);if(!match)throw Error('Clipboard choices are missing');
 return JSON.parse(match[1]);
};
