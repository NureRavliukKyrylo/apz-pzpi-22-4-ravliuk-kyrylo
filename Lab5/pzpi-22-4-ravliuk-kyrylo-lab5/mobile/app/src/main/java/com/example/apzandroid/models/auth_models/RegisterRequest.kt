package com.example.apzandroid.models.auth_models

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String
)