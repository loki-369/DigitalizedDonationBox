package com.example.donationbox.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "donations")
data class DonationEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val amount: Double,
    val currency: String, // e.g., "INR"
    val type: String, // "CASH" or "UPI"
    val timestamp: Long,
    val isVerified: Boolean = true
)
