package com.example.donationbox.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface DonationDao {
    @Query("SELECT * FROM donations ORDER BY timestamp DESC")
    fun getAllDonations(): Flow<List<DonationEntity>>

    @Query("SELECT SUM(amount) FROM donations")
    fun getTotalAmount(): Flow<Double?>

    @Insert
    suspend fun insert(donation: DonationEntity)
}
