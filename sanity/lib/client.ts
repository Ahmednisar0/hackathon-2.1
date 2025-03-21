import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId: "ihdl33fa", 
  dataset: "production",
  apiVersion: "2025-01-01",
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})
