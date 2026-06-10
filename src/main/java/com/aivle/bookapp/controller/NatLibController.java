package com.aivle.bookapp.controller;

import com.aivle.bookapp.ConnectObject;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/*
Controller for connecting to the guklib jungang doseogwan
 */

@Controller
public class NatLibController {

    private final ConnectObject connectObject;

    public NatLibController(ConnectObject connectObject) {
        this.connectObject = connectObject;
    }

    @ResponseBody
    @GetMapping(
            value = "/books",
            produces = MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8"
    )
    public String getBooks(@RequestParam String keyword) {
        return connectObject.connect(keyword);
    }
}