import { useNavigate } from 'react-router-dom';

// ── Donor Guide Page ──────────────────────────────────────────
// Comprehensive blood donation information page
// Linked from Dashboard "Did You Know?" section and Footer
const DonorGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">

      {/* ── Page Header ── */}
      <div
        className="rounded-2xl p-8 mb-8 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #1B2A4A, #C0171D)' }}
      >
        <h1 className="text-3xl font-black mb-2">Blood Donor Guide</h1>
        <p className="text-white/80 text-base">
          Everything you need to know about donating blood safely
        </p>
      </div>

      {/* ── SECTION 1: Who Can Donate ── */}
      <div className="bg-white rounded-2xl shadow p-8 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1B2A4A' }}>
          ✅ Who Can Donate Blood?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Age',         desc: 'Between 18 and 65 years old'             },
            { title: 'Weight',      desc: 'At least 50 kg (110 lbs)'                },
            { title: 'Health',       desc: 'Generally healthy with no active illness' },
            { title: 'Hemoglobin',  desc: 'Adequate hemoglobin levels (checked before donation)' },
            { title: 'Gap',          desc: 'At least 56 days since last donation'    },
            { title: 'No Antibiotics', desc: 'Not currently on antibiotics or medications' },
          ].map(({ icon, title, desc }) => (
            <div key={title}
              className="flex items-start gap-3 p-4 rounded-xl bg-green-100
                         border border-green-300">
              <div>
                <p className="font-semibold text-black text-medium">{title}</p>
                <p className="text-gray-800 text-small mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: Who Cannot Donate ── */}
      <div className="bg-white rounded-2xl shadow p-8 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2"
          style={{ color: '#C0171D' }}>
          ❌ Who Cannot Donate Blood?
        </h2>
        <div className="space-y-3">
          {[
            { text: 'Currently having fever, flu or cold'                          },
            { text: 'Pregnant or breastfeeding women'                              },
            { text: 'Had surgery in the last 6 months'                             },
            { text: 'Got a tattoo or piercing in the last 6 months'               },
            { text: 'Currently taking antibiotics or blood thinners'               },
            { text: 'Living with HIV, Hepatitis B/C, or certain chronic diseases' },
            { text: 'Recently traveled to areas with active disease outbreaks'     },
          ].map(({ icon, text }) => (
            <div key={text}
              className="flex items-center gap-3 p-3 rounded-xl bg-red-50
                         border border-red-100">
              <p className="text-black text-medium">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: Before Donating ── */}
      <div className="bg-white rounded-2xl shadow p-8 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1B2A4A' }}>
           Before You Donate
        </h2>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Eat a healthy meal',
              desc:  'Have a nutritious meal 2-3 hours before donating. Avoid fatty foods.',              
            },
            {
              step: '2',
              title: 'Stay hydrated',
              desc:  'Drink plenty of water — at least 2-3 extra glasses before your donation.',             
            },
            {
              step: '3',
              title: 'Get enough sleep',
              desc:  'Make sure you get at least 7-8 hours of sleep the night before.',
            },
            {
              step: '4',
              title: 'Wear comfortable clothing',
              desc:  'Wear a shirt with sleeves that roll up easily above the elbow.',
            },
            {
              step: '5',
              title: 'Bring your ID',
              desc:  'Bring a valid ID card to the blood bank or donation center.',
            },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center
                           text-white font-black text-sm flex-shrink-0"
                style={{ backgroundColor: '#C0171D' }}
              >
                {step}
              </div>
              <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-black">{title}</p>
                </div>
                <p className="text-gray-900 text-medium">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 4: During Donation ── */}
      <div className="bg-white rounded-2xl shadow p-8 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1B2A4A' }}>
           During the Donation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '⏱️', title: 'Time',        desc: 'The actual donation takes only 8-10 minutes. Total visit is about 45-60 minutes.' },
            { icon: '😌', title: 'Comfort',     desc: 'You will lie or sit comfortably. A small needle prick is all you will feel.'       },
            { icon: '🩸', title: 'Amount',      desc: 'About 450ml (one pint) of blood is collected — less than 10% of your total blood.' },
          ].map(({ icon, title, desc }) => (
            <div key={title}
              className="text-center p-5 rounded-xl border-2"
              style={{ borderColor: '#38cc44', backgroundColor: '#cfeed2' }}>
              <div className="text-4xl mb-3">{icon}</div>
              <p className="font-bold text-gray-800 mb-2">{title}</p>
              <p className="text-gray-800 text-small leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 5: After Donating ── */}
      <div className="bg-white rounded-2xl shadow p-8 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1B2A4A' }}>
           After You Donate
        </h2>
        <div className="space-y-3">
          {[
            { icon: '🔴',text: 'Rest for 10-15 minutes at the donation center before leaving'    },
            { icon: '🔴',text: 'Have a snack and juice — usually provided at donation centers'   },
            { icon: '🔴',text: 'Drink extra fluids for the next 24 hours'                        },
            { icon: '🔴',text: 'Avoid heavy lifting and strenuous exercise for 24 hours'         },
            { icon: '🔴',text: 'Avoid smoking for at least 2 hours after donating'               },
            { icon: '🔴',text: 'Avoid alcohol for at least 24 hours'                             },
            { icon: '🔴',text: 'Keep the bandage on for at least 4 hours'                        },
            { icon: '🔴',text: 'Your body replenishes blood volume within 24 hours'              },
            { icon: '🔴', text: 'Red blood cells are fully replenished within 4-6 weeks'          },
          ].map(({ icon, text }) => (
            <div key={text}
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50
                         border border-blue-100">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <p className="text-gray-700 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 6: Blood Type Compatibility ── */}
      <div className="bg-white rounded-2xl shadow p-8 mb-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2"
          style={{ color: '#1B2A4A' }}>
           Blood Type Compatibility
        </h2>
        <p className="text-gray-500 text-sm mb-5">
          Understanding which blood types are compatible can save lives in emergencies.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1B2A4A' }}>
                <th className="text-white px-4 py-3 text-left rounded-tl-lg">Blood Type</th>
                <th className="text-white px-4 py-3 text-left">Can Donate To</th>
                <th className="text-white px-4 py-3 text-left rounded-tr-lg">Can Receive From</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'O-',  donateTo: 'Everyone (Universal Donor)',  receiveFrom: 'O-'                   },
                { type: 'O+',  donateTo: 'O+, A+, B+, AB+',            receiveFrom: 'O+, O-'               },
                { type: 'A-',  donateTo: 'A-, A+, AB-, AB+',           receiveFrom: 'A-, O-'               },
                { type: 'A+',  donateTo: 'A+, AB+',                    receiveFrom: 'A+, A-, O+, O-'       },
                { type: 'B-',  donateTo: 'B-, B+, AB-, AB+',           receiveFrom: 'B-, O-'               },
                { type: 'B+',  donateTo: 'B+, AB+',                    receiveFrom: 'B+, B-, O+, O-'       },
                { type: 'AB-', donateTo: 'AB-, AB+',                   receiveFrom: 'AB-, A-, B-, O-'      },
                { type: 'AB+', donateTo: 'AB+ only',                   receiveFrom: 'Everyone (Universal Recipient)' },
              ].map((row, i) => (
                <tr key={row.type}
                  className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-white
                                 font-bold text-xs"
                      style={{ backgroundColor: '#8a5859' }}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.donateTo}</td>
                  <td className="px-4 py-3 text-gray-600">{row.receiveFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 7: Benefits of Donating ── */}
      <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1B2A4A' }}>
           ❤️ Benefits of Donating Blood
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Saves Lives',          desc: 'One donation can save up to 3 lives'                      },
            { title: 'Free Health Check',    desc: 'Blood pressure, hemoglobin and other checks are done'     },
            { title: 'Blood Regeneration',  desc: 'Stimulates production of new blood cells'                 },
            { title: 'Heart Health',         desc: 'Regular donation may reduce risk of heart disease'        },
            { title: 'Burns Calories',       desc: 'Donating burns approximately 650 calories'               },
            { title: 'Psychological Benefit', desc: 'Sense of purpose and community contribution'            },
          ].map(({ icon, title, desc }) => (
            <div key={title}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ backgroundColor: '#FFF5F5', border: '1px solid #FEE2E2' }}>
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA — Donate Now ── */}
      <div
        className="rounded-2xl p-8 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #1B2A4A, #C0171D)' }}
      >
        <h2 className="text-2xl font-bold mb-2">Ready to Save a Life?</h2>
        <p className="text-white/80 mb-6">
          Check if there's an urgent blood request near you right now.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('/browse')}
            className="px-8 py-3 rounded-xl font-bold text-sm transition
                       hover:opacity-90"
            style={{ backgroundColor: '#C0171D', border: '2px solid white' }}
          >
            Browse Requests 
          </button>
          <button
            onClick={() => navigate('/request-blood')}
            className="px-8 py-3 rounded-xl font-bold text-sm bg-white transition
                       hover:bg-gray-100"
            style={{ color: '#1B2A4A' }}
          >
            Need Blood? Post Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorGuide;