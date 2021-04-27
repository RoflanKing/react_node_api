const express = require("express")
const app = express()
const axios = require("axios")
const parser = require("xml2json")
const NamecheapApiUser = "****"
const NamecheapUserName = "****"
const NamecheapApiKey = "****"
const NamecheapClientIp = "****"
const NamecheapSetNS = "****"
const NamecheapNS = "ace.ns.cloudflare.com,liv.ns.cloudflare.com"
const CloudflareId = "****""
const CloudflareApiKey = "****"
const CloudflareEmail = "****"

let status
const dict = new Object()

app.post("/", function (req, res, next) {
	const domain = req.body.domain
	const dotIndex = domain.lastIndexOf(".")
	const SLD = domain.substr(0, dotIndex)
	const TLD = domain.substr(dotIndex + 1, domain.length)
	const axiosConfig = {
		headers: {
			"X-Auth-Email": CloudflareEmail,
			"X-Auth-Key": CloudflareApiKey,
			"Content-Type": "application/json",
		},
	}
	const postDataZone = {
		name: domain,
		account: {
			id: CloudflareId,
		},
		jump_start: true,
		type: "full",
	}
	const postDataDnsA = {
		type: "A",
		name: domain,
		content: "****",
		ttl: 1,
		priority: 10,
		proxied: true,
	}
	const postDataDnsCNAME = {
		type: "CNAME",
		name: "www",
		content: domain,
		ttl: 1,
		priority: 10,
		proxied: true,
	}
	new Promise((resolve, reject) => {
		axios.get(`https://api.namecheap.com/xml.response?ApiUser=${NamecheapApiUser}&ApiKey=${NamecheapApiKey}&UserName=${NamecheapUserName}&Command=${NamecheapSetNS}&ClientIp=${NamecheapClientIp}&PageSize=25&SLD=${SLD}&TLD=${TLD}&NameServers=${NamecheapNS}`)
		.then(function (response) {
			const jsonFile = parser.toJson(response.data)
			const json = JSON.parse(jsonFile)
			const jsonStatus = json.ApiResponse.Status
			if(jsonStatus === "ERROR"){
				const jsonError = json.ApiResponse.Errors.Error.$t
				console.log(`Namecheap ERROR: ${jsonError}`)
				status = {name: `Namecheap`,status: `ERROR`,error: `${jsonError}`,domain: `${domain}`,lastReq:false}
				resolve(jsonStatus)
				// reject(jsonStatus)
			}
			else{
				console.log(`NamecheapNS status OK: ${domain}`)
				status = {name: `NamecheapNS `,status: `OK`,error: ``,domain: `${domain}`,lastReq:false}
				resolve(jsonStatus)
			}
		})
		.catch(function(error){
			console.log(error)
		})
	})
		.then(function (jsonStatus) {
			return  new Promise((resolve, reject) => {
				axios.post("https://api.cloudflare.com/client/v4/zones",postDataZone,axiosConfig)
					.then(function (response) {
						console.log(`Cloudflare domain attached OK: ${domain}`)
						status = {name: `Cloudflare domain attached`,status: `OK`,error: ``,domain: `${domain}`,lastReq:false}
						const cloudflareZoneID = response.data.result.id
						resolve(cloudflareZoneID)
					})
					.catch(function (error){
						console.log(`Cloudflare domain attached ERROR: ${error.response.data.errors[0].message}`)
						status = {name: `Cloudflare domain attached`,status: `ERROR`,error: `${error.response.data.errors[0].message}`,domain: `${domain}`,lastReq:true}
					})
				})
		})
		.then(function (cloudflareZoneID){
			console.log(`CloudflareZoneID : ${cloudflareZoneID}`)
			return  new Promise((resolve, reject) => {
				setTimeout(()=>{
					axios.get(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneID}/dns_records?page=1&per_page=99&order=type&direction=asc`,axiosConfig)
						.then(function (response) {
							const result = response.data.result
							const results = []
							results.push(result,cloudflareZoneID)
							console.log(`Cloudflare domain list OK: ${domain}`)
							status = {name: `Cloudflare domain list`,status: `OK`,error: ``,domain: `${domain}`,lastReq:false}
							resolve(results)
						})
						.catch(function (error) {
							console.log(`Cloudflare domain list ERROR: ${error}`)
							status = {name: `Cloudflare domain list`,status: `ERROR`,error: `${error.response.data.errors[0].message}`,domain: `${domain}`,lastReq:true}
						})
				},30000)
			})
		})
		.then(function(results){
			const result = results[0]
			const cloudflareZoneID = results[1]
			let allDnsID =  []
			for(let i = 0; i <= result.length-1; i++){
				allDnsID.push(result[i].id)
			}
			let requests = allDnsID.map(dnsID => axios.delete(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneID}/dns_records/${dnsID}`,axiosConfig))
			return Promise.all(requests)
			.then(responses => {
				for(let response of responses) {
					console.log(`Cloudflare delete DNS OK: ${domain}`)
					status = {name: `Cloudflare delete DNS`,status: `OK`,error: ``,domain: `${domain}`,lastReq:false}
				}
				const results = []
				results.push(responses,cloudflareZoneID)
				return results;
			  })
			.catch(function (error) {
				console.log(`Cloudflare delete DNS ERROR: ${error.response.data.errors[0].message}`)
				status = {name: `Cloudflare delete DNS`,status: `ERROR`,error: `${error.response.data.errors[0].message}`,domain: `${domain}`,lastReq:true}
			})
		})
		.then(function(results){
			const responses = results[0]
			const cloudflareZoneID = results[1]
			Promise.all([
				new Promise((resolve, reject) => {
					axios.post(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneID}/dns_records`,postDataDnsA,axiosConfig)
					.then(function (response) {
						console.log(`Cloudflare create DNS(A) OK:`)
						status = {name: `Cloudflare create DNS(A)`,status: `OK`,error: ``,domain: `${domain}`,lastReq:true}
					})
					.catch(function (error) {
						console.log(`Cloudflare create DNS(A) ERROR: ${error}`)
						status = {name: `Cloudflare create DNS(A)`,status: `ERROR`,error: `${error}`,domain: `${domain}`,lastReq:true}
					})
				 }),
				new Promise((resolve, reject) => {
					axios.post(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneID}/dns_records`,postDataDnsCNAME,axiosConfig)
					.then(function (response) {
						console.log(`Cloudflare create DNS(CNAME) OK: `)
						status = {name: `Cloudflare create DNS(CNAME)`,status: `OK`,error: ``,domain: `${domain}`,lastReq:true}
					 })
					.catch(function (error) {
						console.log(`Cloudflare create DNS(CNAME) ERROR: ${error}`)
						status = {name: `Cloudflare create DNS(CNAME)`,status: `ERROR`,error: `${error}`,domain: `${domain}`,lastReq:true}
					})
				})
			])
		})
})

app.get("/status/:domainIndex", function (req, res) {
	console.log(req.params)
	let domain = req.params.domainIndex
	setTimeout(()=>{
		dict[domain] = status
		console.log(dict[domain])
		res.json(dict[domain])
	},2000)
})
module.exports = app
