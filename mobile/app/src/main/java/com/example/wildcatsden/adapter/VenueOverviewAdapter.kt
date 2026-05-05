package com.example.wildcatsden.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.wildcatsden.R
import com.example.wildcatsden.data.Venue
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup

class VenueOverviewAdapter : RecyclerView.Adapter<VenueOverviewAdapter.ViewHolder>() {

    private var venues = listOf<Venue>()

    fun submitList(newList: List<Venue>) {
        venues = newList
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_venue_overview_card, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(venues[position])
    }

    override fun getItemCount(): Int = venues.size

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val venueImage: ImageView = itemView.findViewById(R.id.venueImage)
        private val venueTitle: TextView = itemView.findViewById(R.id.venueTitle)
        private val venueLocation: TextView = itemView.findViewById(R.id.venueLocation)
        private val venueDescription: TextView = itemView.findViewById(R.id.venueDescription)
        private val amenitiesChipGroup: ChipGroup = itemView.findViewById(R.id.amenitiesChipGroup)
        private val custodianText: TextView = itemView.findViewById(R.id.custodianText)

        fun bind(venue: Venue) {
            venueTitle.text = venue.venueName
            venueLocation.text = venue.venueLocation ?: "No location provided"
            venueDescription.text = venue.description ?: "No description available"
            custodianText.text = "Custodian: ${venue.custodianName ?: "Not assigned"}"

            Glide.with(itemView.context)
                .load(venue.image)
                .placeholder(R.drawable.ic_placeholder)
                .into(venueImage)

            // Display amenities (max 3)
            amenitiesChipGroup.removeAllViews()
            val visibleAmenities = venue.amenities.take(3)

            visibleAmenities.forEach { amenity ->
                val chip = Chip(itemView.context).apply {
                    text = amenity
                    isCheckable = false
                    setChipBackgroundColorResource(R.color.primary)
                    setTextColor(itemView.resources.getColor(android.R.color.white))
                }
                amenitiesChipGroup.addView(chip)
            }

            if (venue.amenities.size > 3) {
                val moreChip = Chip(itemView.context).apply {
                    text = "+${venue.amenities.size - 3}"
                    isCheckable = false
                    setChipBackgroundColorResource(R.color.primary_dark)
                    setTextColor(itemView.resources.getColor(android.R.color.white))
                }
                amenitiesChipGroup.addView(moreChip)
            }

            if (venue.amenities.isEmpty()) {
                val noAmenitiesChip = Chip(itemView.context).apply {
                    text = "No amenities"
                    isCheckable = false
                    isEnabled = false
                }
                amenitiesChipGroup.addView(noAmenitiesChip)
            }
        }
    }
}