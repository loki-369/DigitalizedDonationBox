package com.example.donationbox

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.donationbox.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (org.opencv.android.OpenCVLoader.initDebug()) {
            android.util.Log.d("MainActivity", "OpenCV loaded successfully")
        } else {
            android.util.Log.e("MainActivity", "OpenCV initialization failed!")
        }

        // Start Security Service
        startService(android.content.Intent(this, com.example.donationbox.service.SecurityService::class.java))

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, com.example.donationbox.ui.DonationFragment())
                .commit()
        }
    }
}
