package com.aivle.bookapp;

public final class APIKEY {
    public static APIKEY instance;
    private String apikey = "f8663c55cae8f784fa4e4508915e0eb26fb11a2b402e3a22bc8c1aa09555dd92";
    private APIKEY(){};
    public static APIKEY getInstance(){
        if(instance==null) instance = new APIKEY();
        return instance;
    }

    public String ConnectionURL = "https://www.nl.go.kr/NL/search/openApi/search.do";
    public String getApiKey(){
        return this.apikey;
    }
    public void setURL(String url){
        this.ConnectionURL = url;
    }
    public String getURL(){
        return this.ConnectionURL;
    }
}
