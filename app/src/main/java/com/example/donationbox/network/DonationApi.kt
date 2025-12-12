package com.example.donationbox.network

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

data class DonationRequest(
    val amount: Double,
    val currency: String,
    val type: String,
    val timestamp: Long
)

interface DonationApi {
    @POST("/api/donations")
    fun sendDonation(@Body donation: DonationRequest): Call<Void>

    @POST("/api/heartbeat")
    fun sendHeartbeat(): Call<Void>
}
